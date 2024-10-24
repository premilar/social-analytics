'use client';

import React from 'react';
import PostsTable from './PostsTable';

interface RedditPost {
  title: string;
  content: string;
  score: number;
  numComments: number;
  createdUTC: number;
  url: string;
  categories: string[];
}

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
        <p>No recent posts found.</p>
      )}
    </div>
  );
};

export default TopPosts;
