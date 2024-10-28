import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AddSubredditModalProps {
  isOpen: boolean
  onClose: () => void
  onAddSubreddit: (subreddit: string) => void
}

const AddSubredditModal: React.FC<AddSubredditModalProps> = ({ isOpen, onClose, onAddSubreddit }) => {
  const [subredditUrl, setSubredditUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const subredditName = extractSubredditName(subredditUrl) || subredditUrl.trim()
    if (subredditName) {
      onAddSubreddit(subredditName)
      setSubredditUrl('')
      setError(null)
      onClose()
    } else {
      setError('Please enter a valid subreddit name or URL.')
    }
  }

  const extractSubredditName = (url: string) => {
    const match = url.match(/reddit\.com\/r\/([^/]+)/)
    return match ? match[1] : null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#2d2d2d] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Subreddit</DialogTitle>
          <DialogDescription className="text-[#a0a0a0]">
            Enter a subreddit name or URL to add it to your analytics dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subreddit-input" className="text-white">
              Subreddit Name or URL
            </Label>
            <Input
              id="subreddit-input"
              value={subredditUrl}
              onChange={(e) => setSubredditUrl(e.target.value)}
              placeholder="e.g., AskReddit or https://www.reddit.com/r/AskReddit"
              className="bg-[#3d3d3d] border-gray-600 placeholder-gray-400"
              /*** Added styles to ensure text is visible ***/
              style={{ color: 'black' }}
            />
          </div>
          {error && (
            <Alert variant="destructive" className="bg-red-900 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="bg-[#3d3d3d] text-white hover:bg-[#4d4d4d]">
            Cancel
          </Button>
          <Button onClick={handleAdd} className="bg-[#8b5cf6] hover:bg-[#7c3aed]">
            Add Subreddit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddSubredditModal