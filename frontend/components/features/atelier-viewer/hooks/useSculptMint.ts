import { useState, useCallback } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import * as THREE from 'three';
import { mintSculpt } from '@/utils/transactions';
import { convertParamsToChain } from '@/utils/parameterOffset';
import { encryptModelFile, SEAL_CONFIG } from '@/utils/seal';
import { MintStatus, Atelier, UseSculptMintOptions, SceneRefs, ExportFormat } from '../types';
import { useKiosk } from '@/components/features/entry/hooks';

interface MintStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  subSteps?: {
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'success' | 'error';
  }[];
}

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

const createInitialSteps = (generateStl: boolean): MintStep[] => {
  const subSteps = [
    {
      id: 'upload-screenshot',
      label: 'SCREENSHOT',
      status: 'pending' as const
    },
    {
      id: 'upload-glb',
      label: 'GLB MODEL FILE',
      status: 'pending' as const
    }
  ];

  if (generateStl) {
    subSteps.push({
      id: 'upload-stl',
      label: 'STL FILE (PRINTABLE)',
      status: 'pending' as const
    });
  }

  return [
    {
      id: 'prepare',
      label: 'PREPARING SCULPT FILES',
      status: 'pending'
    },
    {
      id: 'upload',
      label: 'UPLOADING FILES TO WALRUS',
      status: 'pending',
      subSteps
    },
    {
      id: 'transaction',
      label: 'EXECUTING MINT TRANSACTION',
      status: 'pending'
    }
  ];
};

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
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<MintStep[]>(() => createInitialSteps(generateStl));
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { selectedKiosk, kiosks } = useKiosk();
  // const suiClient = useSuiClient();

  const updateStepStatus = useCallback((
    stepId: string,
    status: 'pending' | 'processing' | 'success' | 'error',
    subStepId?: string
  ) => {
    setSteps(prev => prev.map(step => {
      if (step.id !== stepId) return step;
      
      if (subStepId && step.subSteps) {
        const updatedSubSteps = step.subSteps.map(sub =>
          sub.id === subStepId ? { ...sub, status } : sub
        );
        
        const allSuccess = updatedSubSteps.every(sub => sub.status === 'success');
        const hasError = updatedSubSteps.some(sub => sub.status === 'error');
        const hasProcessing = updatedSubSteps.some(sub => sub.status === 'processing');
        
        const parentStatus = allSuccess ? 'success' : hasError ? 'error' : hasProcessing ? 'processing' : step.status;
        
        return { ...step, status: parentStatus, subSteps: updatedSubSteps };
      }
      
      return { ...step, status };
    }));
  }, []);

  const handleMint = useCallback(async (alias: string) => {
    if (!atelier) {
      setMintError('No atelier data available');
      return;
    }

    try {
      if (!alias.trim()) {
        setMintError('Name your model');
        setMintStatus('error');
        return;
      }

      const { scene, renderer, camera } = sceneRefs;
      if (!scene || !renderer || !camera) {
        throw new Error('3D scene not ready');
      }

      // IMPORTANT: Capture screenshot BEFORE changing mint status
      // Once mintStatus changes, the UI switches and the renderer may be unmounted
      renderer.render(scene, camera);
      await new Promise(requestAnimationFrame);
      
      const dataUrl = renderer.domElement.toDataURL('image/png');
      setScreenshotDataUrl(dataUrl); // Save for preview in mint card
      const blob = await (await fetch(dataUrl)).blob();
      const screenshotFile = new File([blob], `${atelier.title}_screenshot_${Date.now()}.png`, { type: 'image/png' });

      // Export GLB BEFORE changing mint status
      const baseName = `${atelier.title}_${Date.now()}`;
      const glbFile = await exportScene(scene, baseName, 'glb');

      // NOW we can change the status and show the progress console
      // Reset steps
      setSteps(createInitialSteps(generateStl));
      setCurrentStep(0);
      setMintStatus('preparing');
      setMintError(null);
      setTxDigest(null);

      // Step 0: Prepare
      updateStepStatus('prepare', 'processing');
      setCurrentStep(0);
      updateStepStatus('prepare', 'success');

      // Step 1: Upload phase
      setCurrentStep(1);
      updateStepStatus('upload', 'processing');

      // Step 1a: Upload screenshot (already captured)
      updateStepStatus('upload', 'processing', 'upload-screenshot');
      const screenshotBlobId = await uploadToWalrus(screenshotFile, 'Screenshot');
      updateStepStatus('upload', 'success', 'upload-screenshot');

      // Step 1b: Upload GLB (already exported)
      updateStepStatus('upload', 'processing', 'upload-glb');
      const glbBlobId = await uploadToWalrus(glbFile, 'GLB');
      updateStepStatus('upload', 'success', 'upload-glb');

      // Step 1c: Optionally generate and encrypt STL for printing
      let stlBlobId: string | null = null;
      let sealResourceId: string | null = null;
      
      if (generateStl) {
        updateStepStatus('upload', 'processing', 'upload-stl');
        console.log('🏗️ Generating STL file for printing...');
        const stlFile = await exportScene(scene, baseName, 'stl');
        
        // SEAL ENCRYPTION for STL
        let fileToUpload: File | Blob = stlFile;
        let encrypted = false;
      
        if (SEAL_CONFIG.enabled) {
          console.log('🔐 Encrypting STL with Seal...');
        
        try {
            // Generate unique resource ID for this sculpt
            // Seal requires a valid hex string (without 0x prefix)
            // Use atelier ID (without 0x) + timestamp in hex
            const timestamp = Date.now().toString(16).padStart(16, '0'); // Convert to hex
            const atelierId = atelier.id.replace(/^0x/, '');
            const uniqueResourceId = `${atelierId}${timestamp}`;
            
            console.log('🔐 Generated Seal resource ID:', {
              atelierId: atelier.id,
              timestamp,
              uniqueResourceId: `0x${uniqueResourceId}`,
            });
            
            const encryptionResult = await encryptModelFile(
              stlFile, 
              {
            sculptId: uniqueResourceId,  // Unique ID for each sculpt (hex string without 0x)
            atelierId: atelier.id,
              },
              'testnet' // Network for Seal key servers
            );
          
          fileToUpload = encryptionResult.encryptedBlob;
            encrypted = encryptionResult.metadata.encrypted;
            
            // Save resource ID for on-chain storage
            if (encrypted) {
              sealResourceId = encryptionResult.resourceId;
            }
          
            console.log('✅ Seal encryption completed:', {
              encrypted,
              resourceId: encryptionResult.resourceId,
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
        updateStepStatus('upload', 'success', 'upload-stl');
      } else {
        console.log('⏭️ Skipping STL generation (toggle off)');
      }

      if (!screenshotBlobId || !glbBlobId) {
        throw new Error('Failed to get required blob IDs');
      }

      // Mark upload step as complete
      updateStepStatus('upload', 'success');

      // Verify kiosk selection
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
      
      // Step 2: Execute on-chain transaction
      setCurrentStep(2);
      updateStepStatus('transaction', 'processing');
      setMintStatus('minting');

      const blueprintUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${screenshotBlobId}`;

      const tx = mintSculpt(
        atelier.id,
        atelier.poolId,
        membershipId,
        kioskId,
        kioskCapId,
        alias,
        blueprintUrl,
        glbBlobId, // glb_file: String (required)
        stlBlobId, // structure: Option<String> (optional STL blob ID)
        sealResourceId, // seal_resource_id: Option<String> (optional Seal resource ID)
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
            updateStepStatus('transaction', 'success');
          },
          onError: (error) => {
            const errorMsg = error instanceof Error ? error.message : 'Failed to mint sculpt';
            setMintError(errorMsg);
            setMintStatus('error');
            updateStepStatus('transaction', 'error');
          }
        }
      );

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to mint sculpt';
      setMintError(errorMsg);
      setMintStatus('error');
      // Mark all incomplete steps as error
      setSteps(prev => prev.map(step => ({
        ...step,
        status: step.status === 'success' ? step.status : 'error',
        subSteps: step.subSteps?.map(sub => ({
          ...sub,
          status: sub.status === 'success' ? sub.status : 'error'
        }))
      })));
    }
  }, [atelier, sceneRefs, exportScene, uploadToWalrus, exportFormat, generateStl, parameters, previewParams, signAndExecuteTransaction, selectedKiosk, kiosks, updateStepStatus]);

  const resetMintStatus = () => {
    setMintStatus('idle');
    setMintError(null);
    setTxDigest(null);
    setCurrentStep(0);
    setSteps(createInitialSteps(generateStl));
    setScreenshotDataUrl(null);
  };

  return {
    mintStatus,
    mintError,
    txDigest,
    currentStep,
    steps,
    screenshotDataUrl,
    handleMint,
    resetMintStatus,
  };
};

