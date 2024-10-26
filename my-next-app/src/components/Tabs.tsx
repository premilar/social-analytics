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
      <div className="mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'topPosts' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
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
