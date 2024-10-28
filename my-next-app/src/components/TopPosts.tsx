'use client'

import React from 'react'
import PostsTable from './PostsTable'
import type { RedditPost } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

interface TopPostsProps {
  posts: RedditPost[]
}

const TopPosts: React.FC<TopPostsProps> = ({ posts }) => {
  // Prepare data for the chart
  const chartData = posts.slice(0, 10).map((post) => ({
    title: post.title || 'No Title', // Full title
    shortTitle: post.title ? post.title.substring(0, 20) + '...' : 'No Title', // Truncated title
    score: post.score || 0,
  }))

  return (
    <Card className="bg-[#1a1a1a] border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Top Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="flex space-x-2 bg-[#2d2d2d] p-1">
            <TabsTrigger value="table" className="flex-1 text-center">
              Table View
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex-1 text-center">
              Chart View
            </TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            {posts.length > 0 ? (
              <PostsTable posts={posts} />
            ) : (
              <p className="text-white text-center py-4">
                No recent posts found. Please check back later.
              </p>
            )}
          </TabsContent>
          <TabsContent value="chart">
            {chartData.length > 0 ? (
              <div className="overflow-auto mt-4">
                <BarChart
                  width={Math.max(chartData.length * 100, 600)} // Dynamic width based on data
                  height={400}
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 100 }} // Increased bottom margin
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="shortTitle"
                    stroke="#fff"
                    tick={{
                      fill: '#fff',
                      fontSize: 12, // Smaller font size
                    }}
                    interval={0}
                    angle={-45} // Adjust angle for readability
                    textAnchor="end"
                  />
                  <YAxis stroke="#fff" tick={{ fill: '#fff' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      borderColor: '#333',
                      whiteSpace: 'normal', // Allow text wrapping
                    }}
                    labelFormatter={(shortTitle) => {
                      const item = chartData.find((entry) => entry.shortTitle === shortTitle)
                      return item ? item.title : shortTitle
                    }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="score" name="Score" fill="#8b5cf6" />
                </BarChart>
              </div>
            ) : (
              <p className="text-white text-center py-4">
                No data available for the chart.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default TopPosts
