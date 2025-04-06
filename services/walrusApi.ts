export class WalrusApiService {
  private publisherUrl: string;
  private aggregatorUrl: string;

  constructor() {
    this.publisherUrl = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER || '';
    this.aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || '';
  }

  // 上傳 blob，添加品質相關的 headers
  async uploadBlob(fileBuffer: Buffer, epochs: string = '1') {
    const response = await fetch(`${this.publisherUrl}/v1/blobs?epochs=${epochs}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-transform',  // 防止 CDN 壓縮
        'X-Content-Type-Options': 'nosniff'  // 防止內容類型猜測
      },
      body: fileBuffer,
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${responseText}`);
    }

    return JSON.parse(responseText);
  }

  // 讀取 blob，添加品質相關的參數
  async readBlob(blobId: string) {
    const response = await fetch(`${this.aggregatorUrl}/v1/blobs/${encodeURIComponent(blobId)}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-transform',
        'X-Content-Type-Options': 'nosniff',
        'Accept': 'image/gif,image/*;q=0.8,*/*;q=0.5'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }

    return response;
  }

  // 處理文件上傳
  async handleFileUpload(formData: FormData, method: 'PUT' | 'POST' = 'POST') {
    const file = formData.get('data') || formData.get('file');
    const epochs = formData.get('epochs')?.toString() || '1';
    
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file');
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    return this.uploadBlob(fileBuffer, epochs);
  }
}

export const walrusApi = new WalrusApiService(); 