import OpenAI from 'openai';
require('dotenv').config({ path: '.env.local' });

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true
});

export async function categorizePost(title: string, content: string) {
  const prompt = `
Analyze the following Reddit post and categorize it into one or more of the following themes:
- Solution Requests: Seeking solutions to problems.
- Pain and Anger: Expressing frustration or anger.
- Advice Requests: Seeking advice or opinions.
- Money Talk: Discussing money or finance topics.

Provide the categories that the post fits into as a JSON array.

Post Title: "${title}"
Post Content: "${content}"

Response:
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that analyzes Reddit posts.' },
        { role: 'user', content: prompt },
      ],
    });

    const result = completion.choices[0].message?.content?.trim() || '[]';

    // Parse the result as JSON array
    const parsedCategories = JSON.parse(result);

    return parsedCategories;
  } catch (error) {
    console.error('Error categorizing post:', error);
    return [];
  }
}
