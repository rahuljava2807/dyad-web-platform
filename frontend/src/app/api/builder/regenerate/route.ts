/**
 * Code Regeneration API Route
 * Phase 3: Handles auto-fix regeneration requests
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      originalPrompt,
      errorContext,
      fixPrompt,
      attemptNumber,
      previousFiles,
    } = body;

    // Validate required fields
    if (!originalPrompt || !errorContext || !fixPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call backend generation API with fix prompt
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/yavi/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fixPrompt,
        industry: 'general', // Use general for error fixes
        context: {
          isErrorFix: true,
          attemptNumber,
          errorType: errorContext.error.type,
          errorCategory: errorContext.diagnostic.category,
          failedFiles: errorContext.diagnostic.failedFiles,
          retainedFiles: errorContext.diagnostic.retainedFiles,
          originalPrompt,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: 'Backend generation failed',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Transform backend response to frontend format
    const regeneratedFiles = result.files.map((file: any) => ({
      path: file.path,
      content: file.content,
      language: file.path.endsWith('.tsx') || file.path.endsWith('.ts')
        ? 'typescript'
        : file.path.endsWith('.jsx') || file.path.endsWith('.js')
        ? 'javascript'
        : file.path.endsWith('.css')
        ? 'css'
        : 'plaintext',
      isNew: file.type === 'create',
    }));

    return NextResponse.json({
      success: true,
      files: regeneratedFiles,
      attemptNumber,
      fixApplied: errorContext.diagnostic.rootCause,
      metadata: {
        errorType: errorContext.error.type,
        errorCategory: errorContext.diagnostic.category,
        filesRegenerated: regeneratedFiles.length,
      },
    });
  } catch (error) {
    console.error('Regeneration API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
