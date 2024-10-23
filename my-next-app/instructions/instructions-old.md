# Project overview
You are building a reddit analytics platform, where users can get analytics of different subreddits, where they can see the top posts, top comments, and top users.

You will use Next.js, Shadcn, TailwindCSS, Lucid icon, Supabase, and Supabase Auth

# Core functionality

1. See list of available subreddits and add new ones
   1. Users can see a list of available subreddits that already created display in cards, common ones like "ollama", "openai"
   2. Useres can click on an add button to add a new subreddit, which should open a modal for users to poaste in reddit url and add
   3. After users add a new reddit, a new card should be added  

2. Subreddit page where you can see top posts, top comments, and top users
   1. Click on each subreddit card, which will open a new page for that subreddit
   2. With 2 tabs, "Top posts" and "Themes"
 
3. Fetch reddit posts data in "Top posts" section
   1. Under "Top posts" page, display the fetched reddit posts from the last 24 hours
   2. We will use snoowrap as the library to fetch the data
   3. Each post includes the title, score, content, url, and created_utc, num_comments
   3. Display the reddits in a table component, sort based on the num of score

4. Analyze reddit posts data in "Themes" section
   1. For each post, we should send post data to OpenAI using structured output to categorize "Solution requests", "Pain and anger", "Advice requests", "Money Talk";
        1. "Solution requests": Posts where people are seeking solutions to problems
        2. "Pain and anger": Posts where people are expressing frustration or anger about a particular topic
        3. "Advice requests": Posts where people are seeking advice or opinions on a specific topic
        4. "Money Talk": Posts where people are discussing money, finance, or economic topics    
    2. This process needs to be run concurrently for all posts, so it's faster
    3. In "Themes" page, we should display each category as a card, with the title, description, a num of counts
    4. Clicking on the card will open a side panel to display all the posts under that category

5. Ability to add new cards
   1. Users should be able to add a new card
   2. After a new card is added, it should trigger the analysis again

# Doc

## Documentation of how to use Snoowrap to fetch reddit data

Code example:

```
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
  userAgent: 'premila-rowles',
  clientId: 'AL1aL6tz0knnS74JijbsXg',
  clientSecret: 'BJ4t0aqB7GPQo2vu1wOcwmxW60g83Q',
 username: 'MountainTelephone373',
  password: 'redditpassbottle7'
});

export async function fetchRecentPosts(subreddit: string = 'ollama'): Promise<RedditPost[]> {
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

// Example usage
async function main() {
  const recentPosts = await fetchRecentPosts();
  console.log('Recent posts:', recentPosts);
}

// Uncomment the following line to run the example
main();


```


## Documentation of how to use OpenAI structured output

Code example:

```
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

// Example usage
async function main() {
  const examplePost: RedditPost = {
    title: "Need help with my budget",
    content: "I'm struggling to make ends meet. Any advice on how to create a better budget and save money?"
  };

  const analysis = await categorizePost(examplePost);
  console.log('Post category analysis:', analysis);
}

// Uncomment the following line to run the example
main();

```

Example output:

```
Post category analysis: {
  solutionRequests: true,
  painAndAnger: false,
  adviceRequests: true,
  moneyTalk: true
}
```


# Current file structure

my-next-app/
(.venv) MacBook-Pro:my-next-app premilarowles$ tree -L 2 -I 'node_modules|.git'
.
├── README.md
├── components.json
├── instructions
│   └── instructions.md
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src
│   ├── app
│   └── components
├── tailwind.config.ts
└── tsconfig.json

6 directories, 15 files


