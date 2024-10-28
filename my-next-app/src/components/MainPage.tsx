'use client'

import React, { useState } from 'react'
import SubredditCard from './SubredditCard'
import AddSubredditModal from './AddSubredditModal'
import { supabase } from '../lib/supabaseClient'
import type { Subreddit } from '../types'
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MainPageProps {
  initialSubreddits: Subreddit[]
}

export default function Component({ initialSubreddits }: MainPageProps = { initialSubreddits: [] }) {
  const [subreddits, setSubreddits] = useState<Subreddit[]>(initialSubreddits || [])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddSubreddit = async (name: string) => {
    const { data: newSubreddit, error } = await supabase
      .from('subreddits')
      .insert({ name })
      .select('*')
      .single()

    if (error) {
      console.error('Error adding subreddit:', error)
      alert('Error adding subreddit')
    } else if (newSubreddit) {
      setSubreddits([...subreddits, newSubreddit])
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-12">
      <Card className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-700">
          <CardTitle className="text-4xl font-extrabold tracking-tight">
            Reddit Analytics Platform
          </CardTitle>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg transform hover:scale-105 transition-transform"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Subreddit
          </Button>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xl text-gray-300">
            Explore and analyze subreddits to gain valuable insights.
          </CardDescription>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
  )
}
