import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, settings } = body;

    // Call the backend streaming endpoint
    const response = await fetch(`${BACKEND_URL}/api/generate/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        context: {
          framework: 'react',
          language: 'typescript',
          industry: settings?.selectedIndustry || 'general',
        },
        userId: 'anonymous', // TODO: Get from auth
        provider: settings?.provider || 'anthropic', // Default to Claude
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Generation failed' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward the SSE stream to the client
    // Set SSE headers
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Generation stream API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to start generation stream' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
