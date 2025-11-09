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
  generateStl: boolean;
  parameters: Record<string, any>; // Parsed parameters from useAtelierParameters
  previewParams: Record<string, any>; // Current parameter values
  options?: UseSculptMintOptions;
}

export const useSculptMint = ({
  atelier,
  sceneRefs,
  exportScene,
  uploadToWalrus,
  exportFormat,
  generateStl,
  parameters,
  previewParams,
  options = {},
}: UseSculptMintProps) => {
  const [mintStatus, setMintStatus] = useState<MintStatus>('idle');
  const [mintError, setMintError] = useState<string | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { selectedKiosk, kiosks } = useKiosk();
  // const suiClient = useSuiClient();

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

      // Step 2: Export GLB (always, for 3D preview)
      const baseName = `${atelier.title}_${Date.now()}`;
      const glbFile = await exportScene(scene, baseName, 'glb');
      console.log('📦 GLB file exported for 3D preview');

      // Step 3: Upload GLB to Walrus (required for glb_file field)
      const glbBlobId = await uploadToWalrus(glbFile, 'GLB');
      console.log('✅ GLB uploaded:', glbBlobId);

      // Step 4: Optionally generate and encrypt STL for printing
      let stlBlobId: string | null = null;
      
      if (generateStl) {
        console.log('🏗️ Generating STL file for printing...');
        const stlFile = await exportScene(scene, baseName, 'stl');
        
        // SEAL ENCRYPTION for STL
        let fileToUpload: File | Blob = stlFile;
        let encrypted = false;
      
        if (SEAL_CONFIG.enabled) {
          setMintStatus('preparing');
          console.log('🔐 Encrypting STL with Seal...');
        
        try {
            const encryptionResult = await encryptModelFile(
              stlFile, 
              {
            sculptId: `sculpt_${Date.now()}`,
            atelierId: atelier.id,
              },
              'testnet' // Network for Seal key servers
            );
          
          fileToUpload = encryptionResult.encryptedBlob;
            encrypted = encryptionResult.metadata.encrypted;
          
            console.log('✅ Seal encryption completed:', {
              encrypted,
              originalSize: encryptionResult.metadata.originalSize,
              encryptedSize: encryptionResult.metadata.encryptedSize,
            });
        } catch (error) {
            console.error('⚠️ Seal encryption failed, uploading unencrypted STL:', error);
          }
        }

        // Upload STL (encrypted or unencrypted)
        stlBlobId = await uploadToWalrus(
          fileToUpload instanceof File ? fileToUpload : new File([fileToUpload], stlFile.name),
          encrypted ? 'STL (Encrypted)' : 'STL'
        );
        console.log('✅ STL uploaded:', stlBlobId, encrypted ? '🔐' : '');
      } else {
        console.log('⏭️ Skipping STL generation (toggle off)');
      }

      if (!screenshotBlobId || !glbBlobId) {
        throw new Error('Failed to get required blob IDs');
      }

      // Step 4: Verify kiosk selection
      if (!selectedKiosk) {
        const errorMsg = kiosks.length === 0 
          ? 'No kiosk found, create at Entry Window.'
          : 'Select a kiosk at Entry Window';
        throw new Error(errorMsg);
      }

      const kioskId = selectedKiosk.kioskId;
      const kioskCapId = selectedKiosk.kioskCapId;

      // Get membership ID
      const membershipId = sessionStorage.getItem('membership-id');
      if (!membershipId) {
        throw new Error('No membership ID found');
      }
      
      // Step 5: Get parameter values and convert to on-chain format
      // Use the current parameter values from previewParams (already processed by useAtelierParameters)
      const userParams: Record<string, number> = {};
      
      // Use previewParams which contains the user's current parameter values
      if (Object.keys(previewParams).length > 0 && Object.keys(parameters).length > 0) {
        Object.entries(previewParams).forEach(([key, value]) => {
          // Ensure value is a number
          if (typeof value === 'number') {
            userParams[key] = value;
          } else if (typeof value === 'string') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              userParams[key] = numValue;
            }
          }
        });
      } else {
        console.warn('⚠️ No parameters found. Check if Atelier has parameters defined.');
      }
      
      // Convert parameters to on-chain values (with offset)
      const { keys: paramKeys, values: paramValues } = convertParamsToChain(
        userParams,
        parameters
      );
      
      // Debug logging
      console.log('🔍 Mint Debug Info:', {
        hasParameters: Object.keys(parameters).length > 0,
        previewParams,
        userParams,
        paramKeys,
        paramValues,
        parameterKeys: Object.keys(parameters),
      });
      
      // Step 7: Execute on-chain transaction
      setMintStatus('minting');

      const tx = mintSculpt(
        atelier.id,
        atelier.poolId,
        membershipId,
        kioskId,
        kioskCapId,
        alias,
        `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${screenshotBlobId}`,
        glbBlobId, // glb_file: String (required)
        stlBlobId, // structure: Option<String> (optional STL blob ID)
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

