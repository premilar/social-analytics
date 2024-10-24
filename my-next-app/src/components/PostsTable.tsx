import React, { useState } from 'react';

interface RedditPost {
  title: string;
  content: string;
  score: number;
  numComments: number;
  createdUTC: number;
  url: string;
  categories: string[];
}

interface PostsTableProps {
  posts: RedditPost[];
}

const PostsTable: React.FC<PostsTableProps> = ({ posts }) => {
  const [sortKey, setSortKey] = useState<'score' | 'createdUTC'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedPosts = [...posts].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * order;
  });

  const handleSort = (key: 'score' | 'createdUTC') => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 cursor-pointer" onClick={() => handleSort('score')}>
            Score {sortKey === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
          </th>
          <th className="py-2">Title</th>
          <th className="py-2 cursor-pointer" onClick={() => handleSort('createdUTC')}>
            Date {sortKey === 'createdUTC' && (sortOrder === 'asc' ? '↑' : '↓')}
          </th>
          <th className="py-2">Comments</th>
          <th className="py-2">Categories</th>
        </tr>
      </thead>
      <tbody>
        {sortedPosts.map((post) => (
          <tr key={post.url}>
            <td className="border px-4 py-2">{post.score}</td>
            <td className="border px-4 py-2">
              <a href={post.url} target="_blank" rel="noopener noreferrer">
                {post.title}
              </a>
            </td>
            <td className="border px-4 py-2">{new Date(post.createdUTC * 1000).toLocaleString()}</td>
            <td className="border px-4 py-2">{post.numComments}</td>
            <td className="border px-4 py-2">
              {post.categories.length > 0 ? post.categories.join(', ') : 'None'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PostsTable;
