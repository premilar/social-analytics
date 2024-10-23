'use client';

import React, { useState } from 'react';
import TopPosts from './TopPosts';

interface TabsProps {
  subreddit: string;
}

const Tabs: React.FC<TabsProps> = ({ subreddit }) => {
  const [activeTab, setActiveTab] = useState<'topPosts' | 'themes'>('topPosts');

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
      {activeTab === 'topPosts' && <TopPosts subreddit={subreddit} />}
      {activeTab === 'themes' && <Themes />}
    </>
  );
};

const Themes: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Themes</h2>
      <p>Display themes analysis here...</p>
    </div>
  );
};

export default Tabs;
