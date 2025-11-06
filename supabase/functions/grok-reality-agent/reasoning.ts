// Additional reasoning and search functions for grok-reality-agent

export async function performReasoning(
  apiKey: string,
  supabase: any,
  userId: string,
  content: string,
  context: any,
  model: string,
  searchParams: any
) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are Grok, an expert at deep reasoning and analysis. Break down complex problems step-by-step with clear logic and real-time data.'
        },
        {
          role: 'user',
          content: `${content}\n\n${context?.instructions || 'Provide detailed step-by-step reasoning.'}`
        }
      ],
      temperature: 0.4,
      search_parameters: searchParams,
    }),
  });

  if (!response.ok) {
    throw new Error(`Reasoning API error: ${response.status}`);
  }

  const data = await response.json();
  const reasoning = data.choices[0].message.content;
  const citations = data.citations || [];

  return {
    reasoning,
    citations,
    model,
    usage: data.usage,
  };
}

export async function performSearch(
  apiKey: string,
  supabase: any,
  userId: string,
  query: string,
  model: string,
  searchParams: any
) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are Grok with real-time search capabilities. Provide comprehensive, cited answers to user queries.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.5,
      search_parameters: searchParams,
    }),
  });

  if (!response.ok) {
    throw new Error(`Search API error: ${response.status}`);
  }

  const data = await response.json();
  const answer = data.choices[0].message.content;
  const citations = data.citations || [];

  return {
    answer,
    query,
    citations,
    model,
    usage: data.usage,
  };
}
