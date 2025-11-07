// Additional reasoning and search functions for grok-reality-agent
import { xAIFetch } from '../_shared/api-client.ts';

export async function performReasoning(
  apiKey: string,
  supabase: any,
  userId: string,
  content: string,
  context: any,
  model: string,
  searchParams: any
) {
  const response = await xAIFetch('/v1/chat/completions', {
    method: 'POST',
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
  }, {
    timeout: 60000,
    maxRetries: 2,
  });

  if (!response.ok) {
    throw response; // Will be handled by error handler
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
  const response = await xAIFetch('/v1/chat/completions', {
    method: 'POST',
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
  }, {
    timeout: 60000,
    maxRetries: 2,
  });

  if (!response.ok) {
    throw response; // Will be handled by error handler
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
