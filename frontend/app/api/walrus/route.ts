import { NextResponse, NextRequest } from 'next/server';
import { walrusApi } from '@/services/walrusApi';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const result = await walrusApi.handleFileUpload(formData, 'PUT');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const blobId = request.nextUrl.searchParams.get('blobId');
    
    if (!blobId) {
      return NextResponse.json(
        { error: 'Invalid blobId' },
        { status: 400 }
      );
    }

    const response = await walrusApi.readBlob(blobId);
    
    // Return binary data directly (important for GLB files)
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Length': response.headers.get('Content-Length') || '',
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