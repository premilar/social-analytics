'use client';

import React, { useState } from 'react';
import SubredditCard from './SubredditCard';
import AddSubredditModal from './AddSubredditModal';
import { supabase } from '../lib/supabaseClient'; // Client-side Supabase client
import type { Subreddit } from '../types';

interface MainPageProps {
  initialSubreddits: Subreddit[];
}

const MainPage: React.FC<MainPageProps> = ({ initialSubreddits }) => {
  const [subreddits, setSubreddits] = useState<Subreddit[]>(initialSubreddits || []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSubreddit = async (name: string) => {
    // Insert the new subreddit into Supabase
    const { data: newSubreddit, error } = await supabase
      .from('subreddits')
      .insert({ name })
      .select('*')
      .single();

    if (error) {
      console.error('Error adding subreddit:', error);
      alert('Error adding subreddit');
    } else if (newSubreddit) {
      setSubreddits([...subreddits, newSubreddit]);
    }
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
            key={subreddit.id}
            name={subreddit.name}
            description={subreddit.description || ''}
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
