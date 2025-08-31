export class WalrusApiService {
  private publisherUrls: string[];
  private aggregatorUrl: string;
  private currentPublisherIndex: number;

  constructor() {
    // 從環境變數讀取 publisher 列表
    const envPublishers = process.env.NEXT_PUBLIC_WALRUS_PUBLISHERS;
    this.publisherUrls = envPublishers 
      ? envPublishers.split(',').map(url => url.trim())
      : [
          'https://publisher.walrus-testnet.walrus.space',
          'https://publisher.testnet.walrus.atalma.io',
          'https://publisher.walrus-01.tududes.com',
          'https://publisher.walrus.banansen.dev',
          'https://testnet-publisher.walrus.graphyte.dev',
          'https://walrus-pub.testnet.obelisk.sh'
        ];

    // 確保所有 URL 都是有效的
    this.publisherUrls = this.publisherUrls.filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        console.warn(`Invalid publisher URL: ${url}`);
        return false;
      }
    });

    if (this.publisherUrls.length === 0) {
      throw new Error('No valid publisher URLs configured');
    }

    this.aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space';
    this.currentPublisherIndex = 0;

    console.log('Configured publishers:', this.publisherUrls);
  }

  private getNextPublisher(): string {
    const publisher = this.publisherUrls[this.currentPublisherIndex];
    this.currentPublisherIndex = (this.currentPublisherIndex + 1) % this.publisherUrls.length;
    return publisher;
  }

  // 上傳 blob，添加品質相關的 headers
  async uploadBlob(fileBuffer: Buffer, epochs: string = '1', retryCount: number = 0): Promise<any> {
    if (retryCount >= this.publisherUrls.length) {
      throw new Error('All publishers failed to respond');
    }

    const publisherUrl = this.getNextPublisher();
    
    try {
      const url = new URL('/v1/blobs', publisherUrl);
      url.searchParams.set('epochs', epochs);

      console.log('Uploading to:', url.toString());
      console.log('File size:', fileBuffer.length, 'bytes');
      console.log('Epochs:', epochs);
      console.log('Retry count:', retryCount);

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Cache-Control': 'no-transform',
          'X-Content-Type-Options': 'nosniff'
        },
        body: new Uint8Array(fileBuffer),
      });

      const responseText = await response.text();
      console.log('Upload response:', response.status, responseText);

      if (!response.ok) {
        // 處理所有可能的錯誤狀態碼
        if (response.status === 429 || response.status === 413 || response.status >= 500) {
          console.log(`Error ${response.status}, trying next publisher...`);
          return this.uploadBlob(fileBuffer, epochs, retryCount + 1);
        }
        throw new Error(`Upload failed: ${response.status} ${responseText}`);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof Error && error.message.includes('failed to fetch')) {
        console.log('Connection failed, trying next publisher...');
        return this.uploadBlob(fileBuffer, epochs, retryCount + 1);
      }
      throw error;
    }
  }

  // 讀取 blob，添加品質相關的參數
  async readBlob(blobId: string) {
    if (!this.aggregatorUrl) {
      throw new Error('Aggregator URL is not configured');
    }

    const url = new URL(`/v1/blobs/${encodeURIComponent(blobId)}`, this.aggregatorUrl);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  // 處理文件上傳
  async handleFileUpload(formData: FormData, method: 'PUT' | 'POST' = 'POST') {
    try {
      const file = formData.get('data') || formData.get('file');
      const epochs = formData.get('epochs')?.toString() || '1';
      
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file');
      }

      console.log('Processing file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        epochs
      });

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      return this.uploadBlob(fileBuffer, epochs);
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }
}

export const walrusApi = new WalrusApiService(); 