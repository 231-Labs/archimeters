import { NextResponse } from 'next/server';
import { walrusApi } from '@/services/walrusApi';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await walrusApi.readBlob(params.id);
    
    // 直接返回原始響應內容和正確的 Content-Type
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 