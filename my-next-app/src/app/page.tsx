'use client';

import React, { useState } from 'react';
import SubredditCard from '../components/SubredditCard';
import AddSubredditModal from '../components/AddSubredditModal';

const initialSubreddits = [
  { name: 'ollama', description: 'A subreddit for ollama discussions' },
  { name: 'openai', description: 'A subreddit for OpenAI discussions' },
  // Add more subreddits as needed
];

const MainPage: React.FC = () => {
  const [subreddits, setSubreddits] = useState(initialSubreddits);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSubreddit = (name: string) => {
    setSubreddits([...subreddits, { name, description: `A subreddit for ${name} discussions` }]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Subreddits</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Add Subreddit
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subreddits.map((subreddit) => (
          <SubredditCard
            key={subreddit.name}
            name={subreddit.name}
            description={subreddit.description}
          />
        ))}
      </div>
      <AddSubredditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSubreddit={handleAddSubreddit}
      />
    </div>
  );
};

export default MainPage;
