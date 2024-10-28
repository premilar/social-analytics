import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  const { title, content } = await request.json();

  if (!title || content === undefined) {
    console.error('Missing title or content:', { title, content });
    return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
  }

  try {
    // Initialize the OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a helpful assistant that analyzes Reddit posts. Analyze the following Reddit post and categorize it into one or more of the following themes:

- Solution Requests: Seeking solutions to problems.
- Pain and Anger: Expressing frustration or anger.
- Advice Requests: Seeking advice or opinions.
- Money Talk: Discussing money or finance topics.

Provide the categories that the post fits into as a JSON array (e.g., ["Advice Requests", "Money Talk"]), **without any additional text or formatting**.

Ensure that your response is a valid JSON array and does not include any explanations or extra text.

Post Title: "${title}"
Post Content: "${content}"

Response:
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0,
    });

    let result = completion.choices[0].message?.content?.trim();

    console.log('OpenAI raw response:', result);

    // Remove any code fences or extraneous text
    result = result?.replace(/```[\s\S]*?```/g, '').trim();
    result = result?.replace(/^[^{\[\"]*/, '').replace(/[^}\]\"]*$/, '').trim();

    console.log('Processed result:', result);

    // Parse the result as JSON array
    const parsedCategories = JSON.parse(result || '[]');

    return NextResponse.json({ categories: parsedCategories }, { status: 200 });
  } catch (error: any) {
    console.error('Error categorizing post:', error);
    return NextResponse.json({ error: 'Failed to categorize post', details: error.message }, { status: 500 });
  }
}
