export interface RedditPost {
  id: string;
  name: string;
  title: string;
  content: string;
  author: string;
  score: number;
  numComments: number;
  createdUTC: number;
  url: string;
  categories: string[];
}

export interface PostData {
  subreddit_id: string;
  reddit_post_id: string;
  title: string;
  author: string;
  content: string;
  score: number;
  num_comments: number;
  created_utc: string;
  url: string;
  fetched_at: string;
}

export interface PostToInsertItem {
  postData: PostData;
  categories: string[];
}

export interface CategorizedPost extends RedditPost {
  categories: string[];
}

export interface Subreddit {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  last_updated?: string;
}

export interface Post {
  id: string;
  subreddit_id: string;
  reddit_post_id: string;
  title: string;
  content?: string;
  score: number;
  num_comments: number;
  created_utc: string;
  url: string;
  fetched_at: string;
  categories: string[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  is_custom: boolean;
  created_by_user_id?: string;
}

export interface PostCategory {
  post_id: string;
  category_id: string;
}
