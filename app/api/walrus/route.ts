import { NextResponse } from 'next/server';
import { walrusApi } from '@/services/walrusApi';

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blobId = searchParams.get('blobId');
    
    if (!blobId) {
      return NextResponse.json(
        { error: 'Invalid blobId' },
        { status: 400 }
      );
    }

    const response = await walrusApi.readBlob(blobId);
    return new NextResponse(await response.text(), {
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