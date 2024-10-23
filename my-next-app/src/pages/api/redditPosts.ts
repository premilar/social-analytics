import { NextApiRequest, NextApiResponse } from 'next';
import { fetchRecentPosts } from '../../lib/reddit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { subreddit } = req.query;
  if (typeof subreddit !== 'string') {
    console.error('Invalid subreddit parameter:', subreddit);
    return res.status(400).json({ error: 'Invalid subreddit' });
  }

  try {
    const posts = await fetchRecentPosts(subreddit);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: 'Failed to fetch posts', details: error });
  }
}
