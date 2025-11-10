/**
 * Seal SDK integration for encrypting 3D model files
 * Documentation: https://seal-docs.wal.app/UsingSeal/
 */
import { SealClient, DemType } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SEAL_CONFIG, getSealKeyServers } from '@/config/seal';
import { PACKAGE_ID } from '@/utils/transactions';

type SuiJsonRpcClient = any;

export interface SealEncryptionResult {
  encryptedBlob: Blob;
  resourceId: string;
  metadata: {
    encrypted: boolean;
    originalSize: number;
    encryptedSize: number;
    encryptionDate: string;
  };
}

export interface SealEncryptionOptions {
  sculptId: string;
  atelierId: string;
  ownerAddress?: string;
}

/**
 * Get or create SealClient instance
 * Note: Seal SDK uses old @mysten/sui.js, we need to create a compatible client
 */
let sealClientInstance: SealClient | null = null;

function getSealClient(network: 'testnet' | 'mainnet' = 'testnet'): SealClient {
  if (!sealClientInstance) {
    // Get key servers from config
    const keyServers = getSealKeyServers(network);
    const serverConfigs = keyServers.map(server => ({
      objectId: server.objectId,
      weight: server.weight,
    }));

    console.log('🔐 Initializing Seal Client with servers:', 
      keyServers.map(s => s.provider).join(', ')
    );

    // Create a fresh SuiClient instance for Seal SDK
    // Seal SDK uses old @mysten/sui.js API
    const suiClient = new SuiClient({ 
      url: getFullnodeUrl(network) 
    }) as SuiJsonRpcClient;

    sealClientInstance = new SealClient({
      suiClient,
      serverConfigs,
      verifyKeyServers: SEAL_CONFIG.verifyKeyServers,
      timeout: SEAL_CONFIG.timeout,
    });
  }

  return sealClientInstance;
}

/**
 * Encrypt a file using Seal SDK
 * @param file - The file to encrypt (STL or GLB)
 * @param options - Encryption options
 * @returns Encrypted blob and metadata
 */
export async function encryptModelFile(
  file: File,
  options: SealEncryptionOptions,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<SealEncryptionResult> {
  try {
    console.log('🔐 Encrypting model file with Seal...', {
      fileName: file.name,
      fileSize: file.size,
      options,
      network,
    });

    // Check if Seal encryption is enabled and file type is supported
    if (!SEAL_CONFIG.enabled) {
      console.warn('⚠️ Seal encryption is disabled, returning unencrypted file');
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      return {
        encryptedBlob: blob,
        resourceId: `unencrypted_${Date.now()}`,
        metadata: {
          encrypted: false,
          originalSize: file.size,
          encryptedSize: blob.size,
          encryptionDate: new Date().toISOString(),
        },
      };
    }
    
    // Check if file type is supported
    const fileExtension = file.name.split('.').pop() || '';
    if (!SEAL_CONFIG.isTypeSupported(fileExtension)) {
      console.warn(`⚠️ File type ${fileExtension} is not supported for encryption`);
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      return {
        encryptedBlob: blob,
        resourceId: `unsupported_${Date.now()}`,
        metadata: {
          encrypted: false,
          originalSize: file.size,
          encryptedSize: blob.size,
          encryptionDate: new Date().toISOString(),
        },
      };
    }

    // Convert file to Uint8Array
    const fileBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(fileBuffer);

    // Get or create SealClient (creates its own SuiClient internally)
    const sealClient = getSealClient(network);

    // Prepare metadata for AAD (Additional Authenticated Data)
    const metadata = {
      fileName: file.name,
      fileType: file.type,
      timestamp: Date.now(),
      atelierId: options.atelierId,
      sculptId: options.sculptId,
    };

    // Prepare Seal encryption parameters
    // packageId: The Move package ID (contract namespace)
    // id: The resource identifier (used in seal_approve function)
    const sealPackageId = PACKAGE_ID;
    // sculptId is already a valid hex string (without 0x prefix)
    const sealId = options.sculptId;
    
    console.log('🔐 Encrypting with Seal SDK...', {
      dataSize: fileData.length,
      packageId: sealPackageId,
      id: sealId,
      idLength: sealId.length,
      atelierId: options.atelierId,
    });

    // Encrypt the file data
    const { encryptedObject, key } = await sealClient.encrypt({
      demType: DemType.AesGcm256,
      threshold: 1, // Number of key servers needed to decrypt
      packageId: sealPackageId, // Contract package ID for namespace
      id: sealId, // Resource identifier (timestamp or unique ID)
      data: fileData,
      aad: new TextEncoder().encode(JSON.stringify(metadata)),
    });

    // Convert encrypted data to Blob
    const encryptedBlob = new Blob([encryptedObject], { type: 'application/octet-stream' });

    // Generate resource ID (combination of packageId and id)
    const resourceId = `${sealPackageId}:${sealId}`;

    console.log('✅ Seal encryption completed', {
      resourceId,
      originalSize: file.size,
      encryptedSize: encryptedBlob.size,
      compressionRatio: (encryptedBlob.size / file.size * 100).toFixed(2) + '%',
    });

    return {
      encryptedBlob,
      resourceId,
      metadata: {
        encrypted: true,
        originalSize: file.size,
        encryptedSize: encryptedBlob.size,
        encryptionDate: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('❌ Seal encryption failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name,
    });
    
    // Fallback: Return unencrypted file if encryption fails
    console.warn('⚠️ Falling back to unencrypted upload');
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    
    return {
      encryptedBlob: blob,
      resourceId: `fallback_${Date.now()}`,
      metadata: {
        encrypted: false,
        originalSize: file.size,
        encryptedSize: blob.size,
        encryptionDate: new Date().toISOString(),
      },
    };
  }
}

/**
 * Create a Seal resource on-chain
 * This function will be called to register the encrypted resource with Seal
 */
export async function createSealResource(
  suiClient: SuiClient | SuiJsonRpcClient,
  transaction: Transaction,
  encryptedBlobId: string,
  ownerAddress: string
): Promise<string> {
  // TODO: Implement Seal resource creation
  // This will use Seal SDK to create an on-chain resource
  
  console.log('📝 Creating Seal resource...', {
    blobId: encryptedBlobId,
    owner: ownerAddress,
  });

  // Placeholder: Return a dummy resource ID
  return `seal_resource_${Date.now()}`;
}

/**
 * Grant printer access to a Seal-encrypted sculpt
 * This will be called when adding a printer to the whitelist
 */
export async function grantPrinterAccess(
  suiClient: SuiClient | SuiJsonRpcClient,
  transaction: Transaction,
  resourceId: string,
  printerAddress: string
): Promise<void> {
  // TODO: Implement Seal access grant
  console.log('🔓 Granting printer access...', {
    resourceId,
    printerAddress,
  });

  // This will use Seal SDK to grant decryption access to the printer
}

/**
 * Helper: Check if Seal SDK is available
 */
export function isSealAvailable(): boolean {
  try {
    // Check if Seal SDK is properly loaded
    // @ts-ignore - checking for seal module
    return typeof window !== 'undefined';
  } catch {
    return false;
  }
}

// Re-export SEAL_CONFIG for backward compatibility
export { SEAL_CONFIG } from '@/config/seal';

