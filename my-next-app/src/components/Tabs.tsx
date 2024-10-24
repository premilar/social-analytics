'use client';

import React, { useState, useEffect } from 'react';
import TopPosts from './TopPosts';
import Themes from './Themes';
import pLimit from 'p-limit';

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
    const fetchAndAnalyzePosts = async () => {
      try {
        // Fetch posts
        const response = await fetch(`/api/redditPosts?subreddit=${subreddit}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedPosts: RedditPost[] = await response.json();

        // Limit concurrent API calls
        const limit = pLimit(5); // Adjust the concurrency level as needed

        // Analyze posts with concurrency limit
        const analysisPromises = fetchedPosts.map((post) =>
          limit(async () => {
            try {
              const res = await fetch('/api/categorizePost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: post.title, content: post.content }),
              });

              if (!res.ok) {
                const errorData = await res.json();
                console.error('Error from categorizePost API:', errorData);
                throw new Error(
                  `Failed to categorize post: ${post.title}. Reason: ${errorData.error || res.statusText}`
                );
              }

              const data = await res.json();
              const categories = data.categories || [];

              return { ...post, categories };
            } catch (error) {
              console.error('Error categorizing post:', error);
              // Return the post with empty categories on failure
              return { ...post, categories: [] };
            }
          })
        );

        const analysisResults = await Promise.all(analysisPromises);

        setPosts(analysisResults);
      } catch (error) {
        console.error('Error fetching or analyzing posts:', error);
        setError('Failed to fetch or analyze posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndAnalyzePosts();
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
