import React from 'react';
import type { CategorizedPost } from '../types';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  posts: CategorizedPost[];
}

const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  category,
  posts,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70 transition-opacity duration-300"
        onClick={onClose}
      ></div>
      {/* Side Panel */}
      <div className="relative w-80 md:w-96 h-full bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0">
        {/* Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white tracking-wide">
            {category} Posts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white focus:outline-none transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* Content */}
        <ScrollArea className="relative z-10 p-6">
          <ul>
            {posts.map((post) => (
              <li key={post.url} className="mb-8">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-purple-400 hover:text-purple-300 transition-colors duration-200"
                >
                  {post.title}
                </a>
                <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                  {post.content.slice(0, 150)}...
                </p>
              </li>
            ))}
          </ul>
        </ScrollArea>
        {/* Overlay Pattern */}
        <div className="absolute inset-0 bg-[url('/path-to-your-pattern.svg')] opacity-10 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default SidePanel;
