import OpenAI from 'openai';
require('dotenv').config({ path: '.env.local' });

// Initialize the OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    defaultHeaders: {
        'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
    },
});

export async function categorizePost(title: string, content: string) {
    const prompt = `
You are a helpful assistant that analyzes Reddit posts. Analyze the following Reddit post and categorize it into one or more of the following themes:

- Solution Requests: Seeking solutions to problems.
- Pain and Anger: Expressing frustration or anger.
- Advice Requests: Seeking advice or opinions.
- Money Talk: Discussing money or finance topics.

If the post does not fit any of these categories, return an empty JSON array [].

Provide the categories that the post fits into as a JSON array (e.g., ["Advice Requests", "Money Talk"]), **without any additional text or formatting**.

Ensure that your response is a valid JSON array and does not include any explanations or extra text.

Post Title: "${title}"
Post Content: "${content}"

Response:
`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100,
            temperature: 0,
        });

        const result = completion.choices[0].message?.content?.trim() || '[]';

        console.log('OpenAI raw response:', result);

        // Parse the result as JSON array
        const parsedCategories = JSON.parse(result);

        return parsedCategories;
    } catch (error) {
        console.error('Error categorizing post:', error);
        return [];
    }
}
