import React from 'react';
import type { CategorizedPost } from '../types';

interface CategoryCardProps {
  title: string;
  description: string;
  count: number;
  posts: CategorizedPost[];
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, description, count, posts, onClick }) => {
  return (
    <div
      className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-gray-600">{description}</p>
      <p className="mt-2 font-semibold">Posts: {count}</p>
    </div>
  );
};

export default CategoryCard;
