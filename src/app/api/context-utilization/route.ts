import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-123';

// Disable static generation for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || '68cc74380846c36e221ee391';
    const documentId = searchParams.get('documentId') || '68d1c35de0c8bdea67990fb3';

    // Forward request to backend API
    const response = await fetch(`${API_BASE_URL}/audit-trail/simple?page=1&limit=1000`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      projectId,
      documentId,
    });

  } catch (error: any) {
    console.error('Context utilization API error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'CONTEXT_UTILIZATION_ERROR',
        message: error.message || 'Failed to fetch context utilization data',
      },
    }, { status: 500 });
  }
}
