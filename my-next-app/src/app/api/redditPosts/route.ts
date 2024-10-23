import { NextRequest, NextResponse } from 'next/server';
import { fetchRecentPosts } from '../../../lib/reddit';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');

  if (!subreddit) {
    console.error('Invalid subreddit parameter:', subreddit);
    return NextResponse.json({ error: 'Invalid subreddit' }, { status: 400 });
  }

  try {
    const posts = await fetchRecentPosts(subreddit);
    return NextResponse.json(posts, { status: 200 });
  } catch (error: any) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error.message },
      { status: 500 }
    );
  }
}
