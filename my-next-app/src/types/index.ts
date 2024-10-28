export interface RedditPost {
  id: string;
  title: string;
  author: string;
  content: string;
  score: number;
  numComments: number;
  createdUTC: number;
  url: string;
  // ... other properties
}
