import React from 'react'
import type { CategorizedPost } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

interface CategoryCardProps {
  title: string
  description: string
  count: number
  posts: CategorizedPost[]
  onClick: () => void
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  count,
  posts,
  onClick,
}) => {
  return (
    <Card
      className="bg-gray-800 border border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>
          <Badge variant="secondary" className="bg-purple-600 text-white">
            {count} posts
          </Badge>
        </div>
        <CardDescription className="text-gray-300">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-400">
            {posts.length > 0 ? `Latest: ${posts[0].title.substring(0, 20)}...` : 'No posts yet'}
          </span>
          <ArrowRight className="h-4 w-4 text-purple-600" />
        </div>
      </CardContent>
    </Card>
  )
}

export default CategoryCard
