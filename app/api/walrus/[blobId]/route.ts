import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { blobId: string } }
) {
  const { blobId } = params;

  try {
    const response = await fetch(`https://rpc.testnet.sui.io/read/${blobId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Walrus');
    }

    const data = await response.blob();
    return new Response(data);
  } catch (error) {
    console.error('Error fetching from Walrus:', error);
    return new Response('Error fetching image', { status: 500 });
  }
} 