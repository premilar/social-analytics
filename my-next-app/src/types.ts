export interface RedditPost {
  title: string;
  content: string;
  score: number;
  numComments: number;
  createdUTC: number;
  url: string;
}

export interface CategorizedPost extends RedditPost {
  categories: string[];
}
