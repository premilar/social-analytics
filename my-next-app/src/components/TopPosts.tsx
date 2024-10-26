'use client';

import React from 'react';
import PostsTable from './PostsTable';
import type { RedditPost } from '../types';

interface TopPostsProps {
  posts: RedditPost[];
}

const TopPosts: React.FC<TopPostsProps> = ({ posts }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Top Posts</h2>
      {posts.length > 0 ? (
        <PostsTable posts={posts} />
      ) : (
        <p>No recent posts found. Please check back later.</p>
      )}
    </div>
  );
};

export default TopPosts;
