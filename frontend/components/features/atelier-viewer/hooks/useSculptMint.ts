import { useState, useCallback } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import * as THREE from 'three';
import { mintSculpt, SUI_CLOCK } from '@/utils/transactions';
import { MintStatus, Atelier, UseSculptMintOptions, SceneRefs, ExportFormat } from '../types';

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

      // Step 1: Capture screenshot (not encrypted)
      renderer.render(scene, camera);
      await new Promise(requestAnimationFrame);
      
      const dataUrl = renderer.domElement.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const screenshotFile = new File([blob], `${atelier.title}_screenshot_${Date.now()}.png`, { type: 'image/png' });
      const screenshotBlobId = await uploadToWalrus(screenshotFile, 'Screenshot');

      // Step 2: Export 3D model
      const baseName = `${atelier.title}_${Date.now()}`;
      const modelFile = await exportScene(scene, baseName, exportFormat);

      // 🔑 SEAL ENCRYPTION EXTENSION POINT
      // Future: Encrypt the model file before uploading
      // Example usage when Seal is implemented:
      // const fileToUpload = options.encryptModel 
      //   ? await options.encryptModel(modelFile, { 
      //       sculptId: `sculpt_${Date.now()}`, 
      //       atelierId: atelier.id 
      //     })
      //   : modelFile;
      const fileToUpload = options.encryptModel 
        ? (await options.encryptModel(modelFile, { 
            sculptId: `sculpt_${Date.now()}`, 
            atelierId: atelier.id 
          })).encryptedBlob as File
        : modelFile;

      // Step 3: Upload model to Walrus
      const modelBlobId = await uploadToWalrus(fileToUpload, exportFormat.toUpperCase());

      if (!screenshotBlobId || !modelBlobId) {
        throw new Error('Failed to get blob IDs');
      }

      setMintStatus('minting');

      // Step 4: Execute on-chain transaction
      const membershipId = sessionStorage.getItem('membership-id');
      if (!membershipId) {
        throw new Error('No membership ID found');
      }

      const tx = await mintSculpt(
        atelier.id,
        membershipId,
        alias,
        `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${screenshotBlobId}`,
        modelBlobId,
        SUI_CLOCK,
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

