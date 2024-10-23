'use client';

import React, { useEffect, useState } from 'react';
import PostsTable from './PostsTable'; // Ensure this path is correct

interface RedditPost {
  title: string;
  content: string;
  score: number;
  numComments: number;
  createdUTC: number;
  url: string;
}

interface TopPostsProps {
  subreddit: string;
}

const TopPosts: React.FC<TopPostsProps> = ({ subreddit }) => {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/redditPosts?subreddit=${subreddit}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to fetch posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [subreddit]);

  if (loading) {
    return <p>Loading posts...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

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
