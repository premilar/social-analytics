'use client';

import React, { useState, useEffect } from 'react';
import CategoryCard from './CategoryCard';
import SidePanel from './SidePanel';
import { CategorizedPost } from '../types';

interface ThemesProps {
  posts: CategorizedPost[];
}

const Themes: React.FC<ThemesProps> = ({ posts }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);
  const [categoryMap, setCategoryMap] = useState<{ [key: string]: CategorizedPost[] }>({});

  useEffect(() => {
    // Group posts by categories
    const categoryMapping: { [key: string]: CategorizedPost[] } = {};
    posts.forEach((post) => {
      post.categories.forEach((category: string) => {
        if (!categoryMapping[category]) {
          categoryMapping[category] = [];
        }
        categoryMapping[category].push(post);
      });
    });

    setCategoryMap(categoryMapping);
  }, [posts]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setIsSidePanelOpen(true);
  };

  const closeSidePanel = () => {
    setIsSidePanelOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Themes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {Object.keys(categoryMap).map((category) => (
          <CategoryCard
            key={category}
            title={category}
            description="" // Add descriptions for each category if desired
            count={categoryMap[category].length}
            posts={categoryMap[category]}
            onClick={() => handleCategoryClick(category)}
          />
        ))}
      </div>
      {selectedCategory && (
        <SidePanel
          isOpen={isSidePanelOpen}
          onClose={closeSidePanel}
          category={selectedCategory}
          posts={categoryMap[selectedCategory]}
        />
      )}
    </div>
  );
};

export default Themes;
