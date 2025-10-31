// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const blobId = searchParams.get('blobId');

  if (!blobId) {
    return new NextResponse('Missing blobId', { status: 400 });
  }

  const aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space';
  const blobUrl = `${aggregatorUrl}/v1/blobs/${blobId}`;

  try {
    const response = await fetch(blobUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': aggregatorUrl,
        'Origin': aggregatorUrl,
      },
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch blob', { status: 500 });
    }

    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[Image Proxy Error]', error);
    return new NextResponse('Proxy error', { status: 500 });
  }
}
