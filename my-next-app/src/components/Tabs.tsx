'use client';

import React, { useState, useEffect } from 'react';
import TopPosts from './TopPosts';
import Themes from './Themes';
import type { RedditPost } from '../types';


interface TabsProps {
  subreddit: string;
}

const Tabs: React.FC<TabsProps> = ({ subreddit }) => {
  const [activeTab, setActiveTab] = useState<'topPosts' | 'themes'>('topPosts');
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/redditPosts?subreddit=${subreddit}`);
        const data = await response.json();

        if (response.ok) {
          setPosts(data);
        } else {
          console.error('Error fetching posts:', data.error);
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [subreddit]); // Re-fetch when subreddit changes

  if (loading) {
    return <p>Loading posts...</p>;
  }

  return (
    <>
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'topPosts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('topPosts')}
          >
            Top Posts
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'themes'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('themes')}
          >
            Themes
          </button>
        </nav>
      </div>
      {activeTab === 'topPosts' && <TopPosts posts={posts} />}
      {activeTab === 'themes' && <Themes posts={posts} />}
    </>
  );
};

export default Tabs;
