import OpenAI from 'openai';
require('dotenv').config({ path: '.env.local' });

// Initialize the OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: "https://oai.helicone.ai/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
  },
});



export async function categorizePost(title: string, content: string) {
    const prompt = `
        You are a helpful assistant that analyzes Reddit posts. Analyze the following Reddit post and categorize it into one or more of the following themes:


        # CATEGORY CRITERIA: """
        - Solution Requests: Seeking solutions to problems.
        - Pain and Anger: Expressing frustration or anger.
        - Advice Requests: Seeking advice or opinions.
        - Money Talk: Discussing money or finance topics.
        """

        # POST DETAILS: """
        Post Title: "${title}"
        Post Content: "${content}"
        """

        Provide the categories that the post fits into as a JSON array (e.g., ["Advice Requests", "Money Talk"]), **without any additional text or formatting**.

        Ensure that your response is a valid JSON array and does not include any explanations or extra text.

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
