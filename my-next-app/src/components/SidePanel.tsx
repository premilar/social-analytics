import React from 'react';
import type { CategorizedPost } from '../types';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  posts: CategorizedPost[];
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, category, posts }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      {/* Side Panel */}
      <div className="relative bg-white w-1/3 h-full shadow-xl overflow-auto">
        <div className="p-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none mb-4"
          >
            Close
          </button>
          <h2 className="text-xl font-bold mb-4">{category} Posts</h2>
          <ul>
            {posts.map((post) => (
              <li key={post.url} className="mb-4">
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                  {post.title}
                </a>
                <p className="text-gray-600">{post.content.slice(0, 100)}...</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
