import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServerClient';
import { fetchRecentPosts } from '../../../lib/reddit';
import { categorizePost } from '../../../lib/openai';
import { Post } from '../../../types';
import { PostData } from '../../../types'; // Import the PostData interface

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subredditName = searchParams.get('subreddit');

  if (!subredditName) {
    console.error('Invalid subreddit parameter:', subredditName);
    return NextResponse.json({ error: 'Invalid subreddit' }, { status: 400 });
  }

  try {
    // Fetch subreddit from Supabase
    let { data: subreddit, error } = await supabaseServer
      .from('subreddits')
      .select('*')
      .eq('name', subredditName)
      .single();

    if (error) {
      console.error('Error fetching subreddit:', error);
      return NextResponse.json({ error: 'Failed to fetch subreddit' }, { status: 500 });
    }

    if (!subreddit) {
      // Subreddit doesn't exist, insert it with last_updated set to null
      const { data: newSubreddit, error: insertError } = await supabaseServer
        .from('subreddits')
        .insert({ name: subredditName, last_updated: null })
        .select('*')
        .single();

      if (insertError || !newSubreddit) {
        console.error('Error inserting subreddit:', insertError);
        return NextResponse.json({ error: 'Failed to insert subreddit' }, { status: 500 });
      }

      subreddit = newSubreddit;
    }

    // Determine if data is fresh
    const lastUpdatedString = subreddit.last_updated;
    let lastUpdated: Date;

    if (lastUpdatedString && !isNaN(new Date(lastUpdatedString).getTime())) {
      lastUpdated = new Date(lastUpdatedString);
    } else {
      lastUpdated = new Date(0); // Use Unix Epoch if null or invalid
    }

    const now = new Date();
    const timeDiff = now.getTime() - lastUpdated.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    let posts = [];

    // Adjusted condition
    if (subreddit.last_updated && hoursDiff >= 0 && hoursDiff < 24) {
      // Data is fresh, fetch from Supabase
      console.log('Fetching data from Supabase...');
      const { data: fetchedPosts, error: postsError } = await supabaseServer
        .from('posts')
        .select(`
          *,
          post_categories (
            categories (
              name
            )
          )
        `)
        .eq('subreddit_id', subreddit.id);

      if (postsError) {
        console.error('Error fetching posts from Supabase:', postsError);
        return NextResponse.json({ error: 'Failed to fetch posts from database' }, { status: 500 });
      }

      if (fetchedPosts.length === 0) {
        // No posts found in Supabase, fetch from Reddit
        console.log('No posts found in Supabase, fetching from Reddit...');
        posts = await fetchFromRedditAndStore(subredditName, subreddit.id);
      } else {
        // Map data to match the expected structure
        posts = fetchedPosts.map((post: any) => {
          // Extract category names from the nested structure
          const categories = post.post_categories
            ?.map((pc: any) => pc.categories?.name)
            .filter((name: string | undefined) => name) || [];

          return {
            id: post.id,
            name: post.reddit_post_id,
            title: post.title,
            content: post.content,
            author: post.author,
            score: post.score,
            numComments: post.num_comments,
            createdUTC: new Date(post.created_utc).getTime() / 1000,
            url: post.url,
            categories: categories,
          };
        });
      }
    } else {
      // Data is stale or doesn't exist, fetch from Reddit
      console.log('Fetching data from Reddit...');
      posts = await fetchFromRedditAndStore(subredditName, subreddit.id);
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

// Helper function to fetch from Reddit and store in Supabase
async function fetchFromRedditAndStore(subredditName: string, subredditId: string) {
  const redditPosts = await fetchRecentPosts(subredditName);
  
  interface PostToInsertItem {
    postData: PostData;
    categories: string[];
  }
  // Explicitly type the postsToInsert array
  const postsToInsert: PostToInsertItem[] = [];

  for (const redditPost of redditPosts) {
    // Analyze the post with OpenAI
    const categories = await categorizePost(redditPost.title, redditPost.content);

    // Prepare the post data for insertion
    const postData: PostData = {
      subreddit_id: subredditId,
      reddit_post_id: redditPost.name,
      title: redditPost.title,
      author: redditPost.author,
      content: redditPost.content,
      score: redditPost.score,
      num_comments: redditPost.numComments,
      created_utc: new Date(redditPost.createdUTC * 1000).toISOString(),
      url: redditPost.url,
      fetched_at: new Date().toISOString(),
    };

    postsToInsert.push({ postData, categories });
  }

  // Upsert posts into Supabase
  const { data: upsertedPosts, error: upsertPostsError } = await supabaseServer
    .from('posts')
    .upsert(postsToInsert.map((item) => item.postData), {
      onConflict: 'reddit_post_id',
    })
    .select('*');

  if (upsertPostsError) {
    console.error('Error upserting posts:', upsertPostsError);
    throw new Error('Failed to upsert posts');
  }

  // Handle categories and post_categories
  for (let i = 0; i < upsertedPosts.length; i++) {
    const post = upsertedPosts[i];
    const categories = postsToInsert[i].categories;

    for (const categoryName of categories) {
      // Ensure the category exists or insert it
      let { data: category, error: categoryError, status } = await supabaseServer
        .from('categories')
        .select('*')
        .eq('name', categoryName)
        .single();

      if (status === 406) {
        // Category does not exist, insert it
        const { data: newCategory, error: insertCategoryError } = await supabaseServer
          .from('categories')
          .insert({ name: categoryName })
          .select('*')
          .single();

        if (insertCategoryError) {
          console.error('Error inserting category:', insertCategoryError);
          continue;
        }

        category = newCategory;
      } else if (categoryError) {
        console.error('Error fetching category:', categoryError);
        continue;
      }

      // Upsert into post_categories
      const { error: postCategoryError } = await supabaseServer
        .from('post_categories')
        .upsert(
          {
            post_id: post.id,
            category_id: category.id,
          },
          {
            onConflict: 'post_id,category_id',
          }
        );

      if (postCategoryError) {
        console.error('Error upserting post_category:', postCategoryError);
      }
    }

    // Add categories to the post object
    post.categories = categories;
  }

  // Map upsertedPosts to include necessary fields before returning
  const mappedPosts = upsertedPosts.map((post, index) => {
    return {
      id: post.id,
      name: post.reddit_post_id,          // Ensure 'name' is set
      title: post.title,
      content: post.content,
      author: post.author,                // Include 'author'
      score: post.score,
      numComments: post.num_comments,
      createdUTC: new Date(post.created_utc).getTime() / 1000,
      url: post.url,
      categories: postsToInsert[index].categories, // Add categories
    };
  });

  // Update the subreddit's last_updated timestamp
  await supabaseServer
    .from('subreddits')
    .update({ last_updated: new Date().toISOString() })
    .eq('id', subredditId);

  return mappedPosts; // Return the mapped posts
}
