import Snoowrap from 'snoowrap';
import type { RedditPost } from '../types';

// Create a Snoowrap instance
const r = new Snoowrap({
  userAgent: 'web:RedditAnalytics:v1.0.0 (by /u/YourRedditUsername)', // Replace with your Reddit username
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  username: process.env.REDDIT_USERNAME!,
  password: process.env.REDDIT_PASSWORD!,
});

export async function fetchRecentPosts(subreddit: string): Promise<RedditPost[]> {
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - 24 * 60 * 60;

  try {
    const posts = await r.getSubreddit(subreddit).getNew({ limit: 100 });

    const recentPosts = posts
      .filter((post) => post.created_utc >= oneDayAgo)
      .map((post) => ({
        id: post.id,
        name: post.name,
        title: post.title,
        author: post.author.name,
        content: post.selftext,
        score: post.score,
        numComments: post.num_comments,
        createdUTC: post.created_utc,
        url: post.url,
        categories: [],
      }));

    return recentPosts;
  } catch (error) {
    console.error('Error fetching posts with snoowrap:', error);
    throw error; // Propagate the error to the API route
  }
}
