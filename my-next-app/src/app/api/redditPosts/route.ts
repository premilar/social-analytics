import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServerClient';
import { fetchRecentPosts } from '../../../lib/reddit';
import { categorizePost } from '../../../lib/openai';
import { Post } from '../../../types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subredditName = searchParams.get('subreddit');

  if (!subredditName) {
    console.error('Invalid subreddit parameter:', subredditName);
    return NextResponse.json({ error: 'Invalid subreddit' }, { status: 400 });
  }

  try {
    // Use supabaseServer to bypass RLS
    let { data: subreddit, error } = await supabaseServer
      .from('subreddits')
      .select('*')
      .eq('name', subredditName)
      .single();

    if (!subreddit) {
      // Insert the subreddit if it doesn't exist
      const { data: newSubreddit, error: insertError } = await supabaseServer
        .from('subreddits')
        .insert({ name: subredditName, last_updated: '2000-01-01T00:00:00Z' })
        .single();

      if (insertError) {
        console.error('Error inserting subreddit:', insertError);
        return NextResponse.json({ error: 'Failed to insert subreddit' }, { status: 500 });
      }

      subreddit = newSubreddit;
    }

    const lastUpdated = new Date(subreddit.last_updated || '2000-01-01T00:00:00Z');
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdated.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    let posts = [];

    if (hoursDiff < 24) {
      // Data is fresh, fetch from Supabase
      console.log('Fetching data from Supabase...');
      const { data: fetchedPosts, error: postsError } = await supabaseServer
        .from('posts')
        .select('*, post_categories(category_id), categories(name)')
        .eq('subreddit_id', subreddit.id);

      if (postsError) {
        console.error('Error fetching posts from Supabase:', postsError);
        return NextResponse.json({ error: 'Failed to fetch posts from database' }, { status: 500 });
      }

      // Map data to match the expected structure
      posts = fetchedPosts.map((post: any) => ({
        title: post.title,
        content: post.content,
        score: post.score,
        numComments: post.num_comments,
        createdUTC: new Date(post.created_utc).getTime() / 1000,
        url: post.url,
        categories: post.categories ? [post.categories.name] : [],
      }));
    } else {
      // Data is stale or doesn't exist, fetch from Reddit
      console.log('Fetching data from Reddit...');
      const redditPosts = await fetchRecentPosts(subredditName);

      // Analyze posts with OpenAI and store in Supabase
      for (const redditPost of redditPosts) {
        // Insert or update the post in Supabase
        const { data: existingPost, error: fetchPostError } = await supabaseServer
          .from('posts')
          .select('*')
          .eq('reddit_post_id', redditPost.url)
          .single();

        let postId;

        if (existingPost) {
          // Update the existing post
          const { error: updateError } = await supabaseServer
            .from('posts')
            .update({
              title: redditPost.title,
              content: redditPost.content,
              score: redditPost.score,
              num_comments: redditPost.numComments,
              created_utc: new Date(redditPost.createdUTC * 1000).toISOString(),
              url: redditPost.url,
              fetched_at: new Date().toISOString(),
            })
            .eq('id', existingPost.id);

          if (updateError) {
            console.error('Error updating post:', updateError);
            continue;
          }

          postId = existingPost.id;
        } else {
          // Insert new post
          const { data: newPost, error: insertPostError } = await supabaseServer
            .from('posts')
            .insert<Post>({
              subreddit_id: subreddit.id,
              reddit_post_id: redditPost.url,
              title: redditPost.title,
              content: redditPost.content,
              score: redditPost.score,
              num_comments: redditPost.numComments,
              created_utc: new Date(redditPost.createdUTC * 1000).toISOString(),
              url: redditPost.url,
            })
            .select() // Ensure data is returned
            .single();

          if (insertPostError) {
            console.error('Error inserting post:', insertPostError);
            continue;
          }

          postId = newPost.id;
        }

        // Analyze the post with OpenAI
        const categories = await categorizePost(redditPost.title, redditPost.content);

        // Insert categories and post_categories
        for (const categoryName of categories) {
          // Ensure the category exists
          const { data: category, error: categoryError } = await supabaseServer
            .from('categories')
            .select('*')
            .eq('name', categoryName)
            .single();

          let categoryId;

          if (category) {
            categoryId = category.id;
          } else {
            const { data: newCategory, error: insertCategoryError } = await supabaseServer
              .from('categories')
              .insert({ name: categoryName })
              .select('*')
              .single();

            if (insertCategoryError) {
              console.error('Error inserting category:', insertCategoryError);
              continue;
            }

            categoryId = newCategory.id;
          }

          // Insert into post_categories
          const { error: postCategoryError } = await supabaseServer
            .from('post_categories')
            .upsert({
              post_id: postId,
              category_id: categoryId,
            });

          if (postCategoryError) {
            console.error('Error inserting post_category:', postCategoryError);
          }
        }

        // Add the categories to the post object
        redditPost.categories = categories;
        posts.push(redditPost);
      }

      // Update the subreddit's last_updated timestamp
      const { error: updateSubredditError } = await supabaseServer
        .from('subreddits')
        .update({ last_updated: new Date().toISOString() })
        .eq('id', subreddit.id);

      if (updateSubredditError) {
        console.error('Error updating subreddits last_updated:', updateSubredditError);
      }
    }

    return NextResponse.json(posts, { status: 200 });
  } catch (error: any) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error.message },
      { status: 500 }
    );
  }
}
