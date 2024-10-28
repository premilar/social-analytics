'use client'

import React, { useState, useEffect } from 'react'
import CategoryCard from './CategoryCard'
import SidePanel from './SidePanel'
import { RedditPost } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ThemesProps {
  posts: RedditPost[]
}

const Themes: React.FC<ThemesProps> = ({ posts }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false)
  const [categoryMap, setCategoryMap] = useState<{ [key: string]: RedditPost[] }>({})

  useEffect(() => {
    // Group posts by categories
    const categoryMapping: { [key: string]: RedditPost[] } = {}
    posts.forEach((post) => {
      post.categories.forEach((category: string) => {
        if (!categoryMapping[category]) {
          categoryMapping[category] = []
        }
        categoryMapping[category].push(post)
      })
    })

    setCategoryMap(categoryMapping)
  }, [posts])

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    setIsSidePanelOpen(true)
  }

  const closeSidePanel = () => {
    setIsSidePanelOpen(false)
    setSelectedCategory(null)
  }

  const sortedCategories = Object.keys(categoryMap).sort(
    (a, b) => categoryMap[b].length - categoryMap[a].length
  )

  return (
    <Card className="bg-[#1a1a1a] border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Themes</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#2d2d2d]">
            <TabsTrigger value="grid" className="text-black">
              Grid View
            </TabsTrigger>
            <TabsTrigger value="list" className="text-black">
              List View
            </TabsTrigger>
          </TabsList>
          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {sortedCategories.length > 0 ? (
                sortedCategories.map((category) => (
                  <CategoryCard
                    key={category}
                    title={category}
                    description={`Top theme with ${categoryMap[category].length} posts`}
                    count={categoryMap[category].length}
                    posts={categoryMap[category]}
                    onClick={() => handleCategoryClick(category)}
                  />
                ))
              ) : (
                <p className="text-white">No categories found.</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="list">
            <ScrollArea className="h-[600px] mt-4">
              {sortedCategories.length > 0 ? (
                sortedCategories.map((category) => (
                  <Card
                    key={category}
                    className="mb-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-all cursor-pointer"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-white flex justify-between items-center">
                        {category}
                        <span className="text-sm font-normal text-gray-400">
                          {categoryMap[category].length} posts
                        </span>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <p className="text-white">No categories found.</p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      {selectedCategory && (
        <SidePanel
          isOpen={isSidePanelOpen}
          onClose={closeSidePanel}
          category={selectedCategory}
          posts={categoryMap[selectedCategory]}
        />
      )}
    </Card>
  )
}

export default Themes