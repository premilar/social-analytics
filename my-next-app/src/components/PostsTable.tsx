import React from 'react'
import type { RedditPost } from '../types'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, MessageCircle } from 'lucide-react'

interface PostsTableProps {
  posts: RedditPost[]
}

const PostsTable: React.FC<PostsTableProps> = ({ posts }) => {
  // Check for any state hooks or state updates here
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800">
        <thead>
          <tr>
            <th className="py-3 px-4 text-left text-gray-300">Title</th>
            <th className="py-3 px-4 text-center text-gray-300">Score</th>
            <th className="py-3 px-4 text-center text-gray-300">Comments</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.name} className="border-t border-gray-700">
              <td className="py-3 px-4 text-white">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {post.title}
                </a>
                <div className="mt-1 text-sm text-gray-400">Posted by u/{post.author}</div>
              </td>
              <td className="py-3 px-4 text-center text-gray-200">
                <div className="flex items-center justify-center space-x-1">
                  <ArrowUp className="w-4 h-4 text-red-500" />
                  <span>{post.score}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-center text-gray-200">
                <div className="flex items-center justify-center space-x-1">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span>{post.numComments}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PostsTable
