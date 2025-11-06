import { useState, useCallback } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import * as THREE from 'three';
import { mintSculpt } from '@/utils/transactions';
import { convertParamsToChain } from '@/utils/parameterOffset';
import { encryptModelFile, SEAL_CONFIG } from '@/utils/seal';
import { MintStatus, Atelier, UseSculptMintOptions, SceneRefs, ExportFormat } from '../types';
import { useKiosk } from '@/components/features/entry/hooks';

interface UseSculptMintProps {
  atelier: Atelier | null;
  sceneRefs: SceneRefs;
  exportScene: (scene: THREE.Scene, fileName: string, format: ExportFormat) => Promise<File>;
  uploadToWalrus: (file: File, fileType: string) => Promise<string>;
  exportFormat: ExportFormat;
  options?: UseSculptMintOptions;
}

export const useSculptMint = ({
  atelier,
  sceneRefs,
  exportScene,
  uploadToWalrus,
  exportFormat,
  options = {},
}: UseSculptMintProps) => {
  const [mintStatus, setMintStatus] = useState<MintStatus>('idle');
  const [mintError, setMintError] = useState<string | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { selectedKiosk, kiosks } = useKiosk();

  const handleMint = useCallback(async (alias: string) => {
    if (!atelier) {
      setMintError('No atelier data available');
      return;
    }

    try {
      setMintStatus('preparing');
      setMintError(null);

      if (!alias.trim()) {
        setMintError('Name your model');
        setMintStatus('error');
        return;
      }

      const { scene, renderer, camera } = sceneRefs;
      if (!scene || !renderer || !camera) {
        throw new Error('3D scene not ready');
      }

      // Step 1: Capture screenshot
      renderer.render(scene, camera);
      await new Promise(requestAnimationFrame);
      
      const dataUrl = renderer.domElement.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const screenshotFile = new File([blob], `${atelier.title}_screenshot_${Date.now()}.png`, { type: 'image/png' });
      const screenshotBlobId = await uploadToWalrus(screenshotFile, 'Screenshot');

      // Step 2: Export 3D model
      const baseName = `${atelier.title}_${Date.now()}`;
      const modelFile = await exportScene(scene, baseName, exportFormat);

      // 🔑 SEAL ENCRYPTION
      // Encrypt the model file before uploading to Walrus
      let fileToUpload: File | Blob = modelFile;
      let sealMetadata: any = null;
      
      if (SEAL_CONFIG.enabled && SEAL_CONFIG.supportedTypes.includes(exportFormat.toLowerCase())) {
        setMintStatus('preparing'); // Update status for encryption
        console.log('🔐 Encrypting model file with Seal...');
        
        try {
          const encryptionResult = await encryptModelFile(modelFile, {
            sculptId: `sculpt_${Date.now()}`,
            atelierId: atelier.id,
          });
          
          fileToUpload = encryptionResult.encryptedBlob;
          sealMetadata = {
            resourceId: encryptionResult.resourceId,
            ...encryptionResult.metadata,
          };
          
          console.log('✅ Seal encryption completed:', sealMetadata);
        } catch (error) {
          console.error('⚠️ Seal encryption failed, uploading unencrypted:', error);
          // Fall back to unencrypted upload
        }
      }

      // Step 3: Upload model to Walrus
      const modelBlobId = await uploadToWalrus(
        fileToUpload instanceof File ? fileToUpload : new File([fileToUpload], modelFile.name),
        exportFormat.toUpperCase()
      );

      if (!screenshotBlobId || !modelBlobId) {
        throw new Error('Failed to get blob IDs');
      }

      setMintStatus('minting');

      // Step 4: Verify kiosk selection
      if (!selectedKiosk) {
        const errorMsg = kiosks.length === 0 
          ? 'No kiosk found, create at Entry Window.'
          : 'Select a kiosk at Entry Window';
        throw new Error(errorMsg);
      }

      const kioskId = selectedKiosk.kioskId;
      const kioskCapId = selectedKiosk.kioskCapId;
      
      // Step 5: Get parameter values from atelier and convert to on-chain format
      // Get user's current parameter values (from preview or use defaults)
      const userParams: Record<string, number> = {};
      
      // For now, use default values from metadata
      // TODO: In the future, allow users to customize parameters before minting
      if (atelier.metadata?.parameters) {
        Object.entries(atelier.metadata.parameters).forEach(([key, paramMeta]: [string, any]) => {
          if (paramMeta.type === 'number') {
            // Use the original default value (can be negative)
            userParams[key] = paramMeta.originalDefault ?? 0;
          }
        });
      }
      
      // Convert parameters to on-chain values (with offset)
      const { keys: paramKeys, values: paramValues } = convertParamsToChain(
        userParams,
        atelier.metadata?.parameters || {}
      );
      
      // Step 6: Execute on-chain transaction
      const membershipId = sessionStorage.getItem('membership-id');
      if (!membershipId) {
        throw new Error('No membership ID found');
      }

      const tx = mintSculpt(
        atelier.id,
        atelier.poolId,
        membershipId,
        kioskId,
        kioskCapId,
        alias,
        `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${screenshotBlobId}`,
        modelBlobId,
        paramKeys,
        paramValues,
        Number(atelier.price),
      );

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            setTxDigest(result.digest);
            setMintStatus('success');
          },
          onError: (error) => {
            setMintError(error instanceof Error ? error.message : 'Failed to mint sculpt');
            setMintStatus('error');
          }
        }
      );

    } catch (error) {
      setMintError(error instanceof Error ? error.message : 'Failed to mint sculpt');
      setMintStatus('error');
    }
  }, [atelier, sceneRefs, exportScene, uploadToWalrus, exportFormat, signAndExecuteTransaction, options]);

  const resetMintStatus = () => {
    setMintStatus('idle');
    setMintError(null);
    setTxDigest(null);
  };

  return {
    mintStatus,
    mintError,
    txDigest,
    handleMint,
    resetMintStatus,
  };
};

