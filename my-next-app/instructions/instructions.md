# Product Requirements Document (PRD)

## Project Overview

We are building a Reddit analytics platform that allows users to get analytics of different subreddits. Users can:

- View a list of available subreddits.
- Add new subreddits for analysis.
- See top posts, comments, and users within a subreddit.
- Analyze posts to categorize them into specific themes.

**Technologies to be used:**

- **Next.js**: For server-side rendering and routing.
- **Shadcn**: UI components library.
- **TailwindCSS**: For styling.
- **Lucide Icons**: For iconography.
- **Supabase**: For database and authentication.
- **Snoowrap**: Reddit API wrapper for data fetching.
- **OpenAI API**: For post content analysis.

## Core Functionality

### 1. Subreddit Management

#### 1.1 View Available Subreddits

- Users can see a list of available subreddits displayed as cards.
- Common subreddits like "ollama" and "openai" are pre-listed.

#### 1.2 Add New Subreddits

- Users can click an "Add Subreddit" button to open a modal.
- The modal allows users to paste a Reddit URL to add a new subreddit.
- Upon adding, a new subreddit card appears in the list.

### 2. Subreddit Detail Page

#### 2.1 Navigation

- Clicking on a subreddit card navigates to that subreddit's detail page.

#### 2.2 Tabs: "Top Posts" and "Themes"

- The detail page contains two tabs:
  - **Top Posts**: Displays recent posts from the subreddit.
  - **Themes**: Analyzes posts and categorizes them into themes.

### 3. Fetching Reddit Posts (Top Posts Section)

#### 3.1 Data Fetching

- Use **Snoowrap** to fetch posts from the last 24 hours.
- Fetch post details including title, score, content, URL, creation date, and number of comments.

#### 3.2 Data Display

- Display the fetched posts in a sortable table.
- The table should be sorted based on the score (highest to lowest).

### 4. Analyzing Reddit Posts (Themes Section)

#### 4.1 Post Analysis

- For each post, send data to the **OpenAI API** to categorize it into themes:
  - **Solution Requests**: Seeking solutions to problems.
  - **Pain and Anger**: Expressing frustration or anger.
  - **Advice Requests**: Seeking advice or opinions.
  - **Money Talk**: Discussing money or finance topics.

#### 4.2 Concurrent Processing

- Run the analysis concurrently for all posts to optimize performance.

#### 4.3 Display Themes

- Display each category as a card with:
  - Title.
  - Description.
  - Count of posts in that category.
- Clicking on a category card opens a side panel showing all posts under that category.

### 5. Custom Themes

#### 5.1 Adding New Themes

- Users can add new theme categories via an "Add Theme" option.
- Upon adding a new theme, re-trigger the analysis to include the new category.

## File Structure

```
my-next-app/
├── README.md
├── next-env.d.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   └── [static assets: SVGs, images]
├── src/
    ├── app/
    │   ├── page.tsx                   // Main page displaying subreddit cards
    │   └── [subreddit]/
    │       └── page.tsx               // Subreddit detail page with tabs
    ├── components/
    │   ├── SubredditCard.tsx          // Subreddit card component
    │   ├── AddSubredditModal.tsx      // Modal to add new subreddits
    │   ├── PostsTable.tsx             // Table to display posts
    │   ├── CategoryCard.tsx           // Theme category card
    │   └── SidePanel.tsx              // Side panel for category posts
    ├── lib/
    │   ├── reddit.ts                  // Reddit data fetching functions
    │   └── openai.ts                  // Post analysis functions
    └── styles/
        └── globals.css                // Global styles
```

## Detailed Specifications

### Components Overview

#### 1. SubredditCard.tsx

- Displays subreddit name and basic info.
- Navigates to the subreddit detail page on click.

#### 2. AddSubredditModal.tsx

- Modal with an input field for the subreddit URL.
- Validates the URL and adds the subreddit to the list.

#### 3. PostsTable.tsx

- Displays a list of posts in a table format.
- Columns include title, score, content snippet, creation date, and number of comments.
- Allows sorting based on different columns, defaulting to score.

#### 4. CategoryCard.tsx

- Represents a theme category.
- Shows the category title, description, and post count.
- On click, opens the SidePanel with posts under that category.

#### 5. SidePanel.tsx

- Slides in from the side when a category card is clicked.
- Displays a list of posts under the selected category.
- Includes post details like title, snippet, and a link to the original post.

### Data Fetching and Analysis

#### 1. Fetching Reddit Posts with Snoowrap

We use Snoowrap to interact with Reddit's API to fetch recent posts.

**Code Example:**

```typescript
import Snoowrap from 'snoowrap';

// Define the structure for a Reddit post
interface RedditPost {
  title: string;
  content: string;
  score: number;
  numComments: number;
  createdUTC: number;
  url: string;
}

// Create a Snoowrap instance
const r = new Snoowrap({
  userAgent: 'your-app-name',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  username: 'your-username',
  password: 'your-password',
});

export async function fetchRecentPosts(subreddit: string): Promise<RedditPost[]> {
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - 24 * 60 * 60;

  try {
    const posts = await r.getSubreddit(subreddit).getNew({ limit: 100 });
    
    const recentPosts = posts
      .filter((post) => post.created_utc >= oneDayAgo)
      .map((post) => ({
        title: post.title,
        content: post.selftext,
        score: post.score,
        numComments: post.num_comments,
        createdUTC: post.created_utc,
        url: post.url,
      }));

    return recentPosts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}
```

#### 2. Analyzing Posts with OpenAI API

We use OpenAI's API to categorize posts into predefined themes.

**Code Example:**

```typescript
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

// Define the structure for the post category analysis using Zod with descriptions
const PostCategoryAnalysisSchema = z.object({
  solutionRequests: z.boolean().describe("Posts where people are seeking solutions to problems"),
  painAndAnger: z.boolean().describe("Posts where people are expressing frustration or anger about a particular topic"),
  adviceRequests: z.boolean().describe("Posts where people are seeking advice or opinions on a specific topic"),
  moneyTalk: z.boolean().describe("Posts where people are discussing money, finance, or economic topics"),
});

// Define the structure for a Reddit post
interface RedditPost {
  title: string;
  content: string;
}

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function categorizePost(post: RedditPost) {
  const prompt = `
Analyze the following Reddit post and categorize it based on the provided criteria.

Post Title: ${post.title}
Post Content: ${post.content}

Respond with a JSON object where each category is a boolean (true/false) indicating if the post fits that category.
`;

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that analyzes Reddit posts." },
        { role: "user", content: prompt }
      ],
      response_format: zodResponseFormat(PostCategoryAnalysisSchema, "post_category_analysis"),
    });

    const analysis = completion.choices[0].message.parsed;
    return analysis;
    
  } catch (error) {
    console.error('Error categorizing post:', error);
    return {
      solutionRequests: false,
      painAndAnger: false,
      adviceRequests: false,
      moneyTalk: false,
    };
  }
}
```

#### 3. Concurrent Analysis

- Use `Promise.all` to run `categorizePost` on all posts concurrently.
- This improves performance by analyzing multiple posts at the same time.

**Implementation Suggestion:**

```typescript
async function analyzePosts(posts: RedditPost[]) {
  const analysisResults = await Promise.all(posts.map(post => categorizePost(post)));
  // Combine results with posts
  return posts.map((post, index) => ({
    ...post,
    categories: analysisResults[index],
  }));
}
```

### User Interface and Experience

#### 1. Main Page (`src/app/page.tsx`)

- Displays a grid of subreddit cards (`SubredditCard`).
- Includes an "Add Subreddit" button that opens `AddSubredditModal`.

#### 2. Subreddit Detail Page (`src/app/[subreddit]/page.tsx`)

- Contains two tabs: "Top Posts" and "Themes".

##### 2.1 Top Posts Tab

- Shows the `PostsTable` with recent posts.
- Allows users to sort posts based on score or other metrics.

##### 2.2 Themes Tab

- Displays theme categories using `CategoryCard`.
- Shows the count of posts in each category.
- Clicking a category opens the `SidePanel`.

#### 3. Adding New Themes

- An option to add new themes is available on the "Themes" tab.
- Users can define a new category with a title and description.
- Adding a new theme re-triggers the analysis to include the new category.

### Database and Authentication

#### 1. Supabase Integration

- **Authentication**: Use Supabase Auth for user authentication.
- **Database**: Store user data, list of subreddits, custom themes, and analysis results.

#### 2. Data Models

- **User**: User information and preferences.
- **Subreddit**: List of subreddits added by users.
- **Post**: Cached Reddit posts with analysis results.
- **Theme**: Predefined and user-added themes.

## Additional Documentation

### Technologies Overview

#### 1. Next.js

- Framework for building server-rendered React applications.
- Provides routing, server-side rendering, and static site generation.

#### 2. Shadcn

- UI components built with Radix UI and styled with TailwindCSS.
- Provides accessible and customizable components.

#### 3. TailwindCSS

- Utility-first CSS framework.
- Allows for rapid styling of components using predefined classes.

#### 4. Lucide Icons

- A set of free, open-source icons.
- Used for enhancing the UI with visual cues.

#### 5. Supabase

- Backend as a Service (BaaS) providing database and authentication services.
- Built on top of PostgreSQL.

#### 6. Snoowrap

- A JavaScript wrapper for the Reddit API.
- Simplifies fetching data from Reddit.

#### 7. OpenAI API

- Provides access to advanced language models for text analysis.
- Used here for categorizing Reddit posts based on content.

### Environment Variables and Configuration

- **OpenAI API Key**: Stored in `process.env.OPENAI_API_KEY`.
- **Reddit API Credentials**: Stored securely and not hard-coded.
- **Supabase Credentials**: Stored in environment variables.

## Development Guidelines

### Coding Standards

- Use TypeScript for type safety.
- Follow React and Next.js best practices.
- Keep components modular and reusable.

### Error Handling

- Implement try-catch blocks when fetching data or making API calls.
- Display user-friendly error messages in the UI.

### Performance Optimization

- Utilize data caching where appropriate.
- Optimize concurrent processing for the OpenAI analysis.
- Lazy load components as needed.

### Security Considerations

- Never expose API keys or sensitive information in the client-side code.
- Sanitize user input, especially when adding new subreddits or themes.
- Use HTTPS for all API calls.

### Testing

- Write unit tests for utility functions in `reddit.ts` and `openai.ts`.
- Perform integration testing on key components.
- Test the application across different browsers and devices.

## Conclusion

This document outlines the requirements and specifications for building a Reddit analytics platform. By adhering to this PRD, developers should have a clear understanding of the project scope, architecture, and implementation details necessary to bring this platform to life.

If there are any questions or clarifications needed, please refer to the provided documentation or reach out to the project lead.