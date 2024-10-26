# Design Document for Supabase Integration

## Project Overview

The project is a Reddit analytics platform built with Next.js. It allows users to view and analyze different subreddits by fetching Reddit posts and categorizing them using the OpenAI API. Currently, the application fetches Reddit data and calls the OpenAI API every time a user visits a subreddit page, which is not optimal in terms of performance and cost.

**Objective**: Integrate Supabase to store Reddit posts and AI analysis data. Modify the application to fetch data from Supabase and only refetch from Reddit and re-analyze with OpenAI if the data is older than 24 hours.

## Existing Project Structure

The project is organized as follows:

```
.
├── README.md
├── components.json
├── instructions
│   ├── instructions.md
│   └── supabasesetup.md
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src
│   ├── app
│   │   ├── [subreddit]
│   │   ├── api
│   │   ├── favicon.ico
│   │   ├── fonts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── AddSubredditModal.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── PostsTable.tsx
│   │   ├── SidePanel.tsx
│   │   ├── SubredditCard.tsx
│   │   ├── Tabs.tsx
│   │   ├── Themes.tsx
│   │   ├── TopPosts.tsx
│   │   └── ui
│   ├── lib
│   │   ├── openai.ts
│   │   └── reddit.ts
│   └── types.ts
├── tailwind.config.ts
└── tsconfig.json
```

### Key Components

- **src/app**: Contains Next.js pages and API routes.
  - **[subreddit]**: Dynamic route for subreddit detail pages.
  - **api**: API routes for data fetching and processing.
  - **layout.tsx**: Global layout component.
  - **page.tsx**: Main landing page.

- **src/components**: Reusable React components.
  - **AddSubredditModal.tsx**: Modal to add new subreddits.
  - **CategoryCard.tsx**: Displays a theme category.
  - **PostsTable.tsx**: Table to display posts.
  - **SidePanel.tsx**: Panel to show posts under a category.
  - **SubredditCard.tsx**: Card representing a subreddit.
  - **Tabs.tsx**: Tabs for navigation within the subreddit page.
  - **Themes.tsx**: Handles the display of theme categories.
  - **TopPosts.tsx**: Displays top posts in a subreddit.
  - **ui**: UI component utilities.

- **src/lib**: Library functions.
  - **openai.ts**: Interacts with the OpenAI API.
  - **reddit.ts**: Fetches data from Reddit using Snoowrap.

- **src/types.ts**: TypeScript type definitions.

## Supabase Integration Plan

### Overview

Integrate Supabase to:

- Store Reddit posts and their AI-analyzed categories.
- Reduce redundant API calls to Reddit and OpenAI.
- Serve data quickly to the frontend from a database.
- Ensure data is refreshed only when older than 24 hours.

### Steps

1. **Set Up Supabase Project**: Create a new Supabase project and obtain the necessary credentials.
2. **Design Database Schema**: Define tables and relationships to store subreddits, posts, categories, and associations.
3. **Implement Data Fetching Logic**: Modify data fetching routines to interact with Supabase.
4. **Update API Routes**: Adjust Next.js API routes to fetch and store data in Supabase.
5. **Modify Frontend Components**: Ensure components fetch data from the updated API routes.
6. **Implement Data Freshness Checks**: Add logic to check if data needs refreshing based on timestamps.

## Database Design

### Tables and Schemas

#### 1. **Subreddits**

**Purpose**: Store information about subreddits being tracked.

- **Table Name**: `subreddits`
- **Columns**:
  - `id`: UUID (Primary Key)
  - `name`: Text (Unique, Not Null)
    - The name of the subreddit (e.g., `openai`).
  - `description`: Text
    - Optional description of the subreddit.
  - `created_at`: Timestamp with Time Zone (Default: `now()`)
  - `last_updated`: Timestamp with Time Zone
    - The last time the subreddit data was fetched and analyzed.

#### 2. **Posts**

**Purpose**: Store Reddit posts fetched from subreddits.

- **Table Name**: `posts`
- **Columns**:
  - `id`: UUID (Primary Key)
  - `subreddit_id`: UUID (Foreign Key to `subreddits.id`, Not Null)
  - `reddit_post_id`: Text (Unique, Not Null)
    - The Reddit ID of the post.
  - `title`: Text (Not Null)
  - `content`: Text
  - `score`: Integer
  - `num_comments`: Integer
  - `created_utc`: Timestamp with Time Zone
  - `url`: Text
  - `fetched_at`: Timestamp with Time Zone (Default: `now()`)

#### 3. **Categories**

**Purpose**: Store predefined and user-defined categories for posts.

- **Table Name**: `categories`
- **Columns**:
  - `id`: UUID (Primary Key)
  - `name`: Text (Unique, Not Null)
    - Name of the category (e.g., `Solution Requests`).
  - `description`: Text
  - `created_at`: Timestamp with Time Zone (Default: `now()`)
  - `is_custom`: Boolean (Default: `false`)
    - Indicates if the category is user-defined.
  - `created_by_user_id`: UUID (Nullable)
    - References the user who created the custom category.

#### 4. **PostCategories**

**Purpose**: Many-to-many relationship between posts and categories.

- **Table Name**: `post_categories`
- **Columns**:
  - `post_id`: UUID (Foreign Key to `posts.id`, Not Null)
  - `category_id`: UUID (Foreign Key to `categories.id`, Not Null)
- **Primary Key**: Composite (`post_id`, `category_id`)

### Relationships and Constraints

- **Foreign Key Constraints**:
  - `posts.subreddit_id` references `subreddits.id`.
  - `post_categories.post_id` references `posts.id`.
  - `post_categories.category_id` references `categories.id`.
- **Unique Constraints**:
  - `subreddits.name` must be unique.
  - `posts.reddit_post_id` must be unique.
  - `categories.name` must be unique.
- **Indexes**:
  - Create indexes on `posts.subreddit_id`, `posts.fetched_at`, `posts.created_utc` for efficient querying.
  - Index `post_categories.category_id` for efficient category-based queries.

## Data Fetching and Caching Strategy

### Logic Flow

1. **User Requests Subreddit Page**:
   - Frontend calls an API route (e.g., `/api/getSubredditData`).

2. **API Route Checks Data Freshness**:
   - Query `subreddits` table for the subreddit.
     - **If the subreddit does not exist**:
       - Insert a new record into `subreddits`.
       - Set `last_updated` to a timestamp older than 24 hours to trigger data fetching.
     - **If subreddit exists**, check `last_updated`.
   - **If data is fresh (less than 24 hours old)**:
     - Retrieve posts and categories from Supabase.
   - **If data is stale (older than 24 hours)**:
     - Fetch new posts from Reddit.
     - Update or insert posts into `posts` table.
     - Analyze posts with OpenAI.
     - Update `last_updated` in `subreddits` table.

### Fetching and Storing Reddit Posts

- Use the existing `reddit.ts` library to fetch posts.
- Filter posts created within the last 24 hours.
- For each post:
  - Check if it exists in `posts` (using `reddit_post_id`).
    - **If it exists**:
      - Update fields if necessary (e.g., `score`, `num_comments`).
    - **If it doesn't exist**:
      - Insert a new record into `posts`.

### Analyzing Posts with OpenAI

- Use `openai.ts` to categorize posts.
- For each post:
  - Send the post to OpenAI API.
  - Receive categories as a list of category names.
  - For each category:
    - Ensure the category exists in `categories` table.
      - **If it doesn't exist** (for new predefined or custom categories):
        - Insert it into `categories`.
    - Insert a record into `post_categories` linking the post and category.

## Core Parts to Build for Supabase Integration

### Backend

1. **Supabase Client Setup**:
   - Configure Supabase client in the Next.js application.
   - Securely manage environment variables for Supabase credentials.

2. **API Routes Modification**:
   - Update existing API routes to interact with Supabase.
     - **Example**: Modify `/api/redditPosts` to check Supabase before fetching from Reddit.
   - Create new API routes if necessary.
     - **Example**: `/api/getSubredditData` to encapsulate data retrieval logic.

3. **Data Fetching Logic**:
   - Implement logic to check data freshness.
   - Integrate data fetching, storing, and analysis in server-side functions.
   - Ensure efficient data retrieval with proper indexing and query optimization.

4. **Error Handling and Logging**:
   - Implement robust error handling for API calls and database interactions.
   - Log errors and important events for monitoring and debugging.

### Frontend

1. **Fetching Data from API Routes**:
   - Update components to fetch data from the new or updated API routes.
   - Adjust data fetching hooks to handle loading states and errors.

2. **State Management**:
   - Ensure components properly reflect the latest data from Supabase.
   - Handle cases where data is being updated in the background.

3. **UI Updates**:
   - Indicate to users when data is being refreshed.
   - Provide options to manually trigger data refresh if appropriate.

## Additional Considerations

### Custom Themes

- Allow users to add custom categories.
  - Update `categories` table with `is_custom` and `created_by_user_id`.
- Adjust analysis logic to include custom categories.
  - Possibly store custom categorization criteria per user.

### User Authentication

- Implement Supabase Authentication if user-specific features are needed.
- Store user data and relationships in Supabase.

### Performance Optimization

- **Caching**: Use Supabase's built-in caching mechanisms if available.
- **Concurrent Fetching and Processing**:
  - Use parallel processing when fetching and analyzing posts.
  - Be mindful of rate limits on Reddit and OpenAI APIs.

### Security

- **API Keys Management**:
  - Securely store API keys for Reddit, OpenAI, and Supabase.
- **Data Validation**:
  - Validate all inputs and outputs.
  - Sanitize data to prevent injection attacks.
- **Access Control**:
  - Restrict API routes and database access to authenticated users if necessary.

## Schema Diagram

```
+----------------+        +----------------+        +-------------------+
|   subreddits   |        |     posts      |        |    categories     |
+----------------+        +----------------+        +-------------------+
| id (UUID)      |<----+  | id (UUID)      |        | id (UUID)         |
| name           |     |  | subreddit_id   |        | name              |
| description    |     |  | reddit_post_id |        | description       |
| created_at     |     |  | title          |        | is_custom         |
| last_updated   |     |  | content        |        | created_by_user_id |
+----------------+     |  | score          |        +-------------------+
                      |  | num_comments   |
                      |  | created_utc    |          +-------------------+
                      |  | url            |          |  post_categories  |
                      |  | fetched_at     |          +-------------------+
                      |  +----------------+          | post_id (UUID)    |
                      |                             | category_id (UUID) |
                      |                             +-------------------+
                      |                                   
                      +------------------------------------------+
```

## Implementation Summary

- **Database Setup**:
  - Create the necessary tables in Supabase with defined schemas.
  - Set up relationships and constraints.

- **Data Flow**:
  - Frontend requests data via API routes.
  - API routes interact with Supabase to fetch and store data.
  - Data freshness is checked, and new data is fetched and analyzed if needed.

- **Code Adjustments**:
  - Replace direct Reddit and OpenAI API calls in components with calls to the updated API routes.
  - Modify existing utility functions in `lib` to support database interactions.

- **Testing**:
  - Test data fetching and storing processes thoroughly.
  - Ensure data integrity and accuracy in the database.
  - Validate that data updates correctly after 24 hours.

## Conclusion

By integrating Supabase, the application will:

- Reduce redundant API calls to external services.
- Provide faster data retrieval to users.
- Maintain data consistency and freshness.
- Be scalable and easier to maintain.

The backend developer should focus on setting up the Supabase database according to the proposed schema, updating API routes, and ensuring seamless integration with the existing project structure.