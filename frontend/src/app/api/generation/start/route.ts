import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, settings } = body;

    // Call the backend AI service
    const response = await fetch(`${BACKEND_URL}/api/generate`, {
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
        provider: settings?.provider || 'openai',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Generation failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Generate a session ID for streaming (simplified for now)
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store the generated files temporarily (in a real app, use Redis or similar)
    // For now, we'll return the data directly

    return NextResponse.json({
      sessionId,
      files: data.files || [],
      explanation: data.explanation || '',
      dependencies: data.dependencies || [],
      thinking: data.thinking || null, // Include thinking steps
      source: data.source || 'ai',
      templateId: data.templateId || null,
      templateName: data.templateName || null,
    });
  } catch (error) {
    console.error('Generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate application' },
      { status: 500 }
    );
  }
}
