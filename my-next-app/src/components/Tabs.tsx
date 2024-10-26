'use client';

import React, { useState, useEffect } from 'react';
import TopPosts from './TopPosts';
import Themes from './Themes';

interface RedditPost {
  title: string;
  content: string;
  score: number;
  numComments: number;
  createdUTC: number;
  url: string;
  categories: string[];
}

interface TabsProps {
  subreddit: string;
}

const Tabs: React.FC<TabsProps> = ({ subreddit }) => {
  const [activeTab, setActiveTab] = useState<'topPosts' | 'themes'>('topPosts');
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch posts with categories from the API
        const response = await fetch(`/api/redditPosts?subreddit=${subreddit}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedPosts: RedditPost[] = await response.json();
        setPosts(fetchedPosts);
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
    <>
      <div className="mb-4">
        <button
          className={`px-4 py-2 ${
            activeTab === 'topPosts' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('topPosts')}
        >
          Top Posts
        </button>
        <button
          className={`px-4 py-2 ml-2 ${
            activeTab === 'themes' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('themes')}
        >
          Themes
        </button>
      </div>
      {activeTab === 'topPosts' && <TopPosts posts={posts} />}
      {activeTab === 'themes' && <Themes posts={posts} />}
    </>
  );
};

export default Tabs;
