import { useEffect, useMemo, useCallback } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { PublisherMintLayout } from '@/components/features/design-publisher/components/PublisherMintLayout';
import { ParametricViewer } from '@/components/features/design-publisher/components/pages/ParametricViewer';
import { useDesignPublisherForm } from '@/components/features/design-publisher/hooks/useDesignPublisherForm';
import { createMetadataJson } from '@/components/features/design-publisher/utils/metadata';

export default function DesignPublisher() {
  const currentAccount = useCurrentAccount();
  const {
    // Form state
    artworkInfo,
    artistInfo,
    designSettings,
    updateArtworkInfo,
    
    // Parameters
    extractedParameters,
    previewParams,
    
    // Validation
    validationState,
    
    // Files
    imageFile,
    imageUrl,
    algoFile,
    userScript,
    handleImageFileChange,
    handleAlgoFileChange,
    handlePriceChange,
    
    // Membership
    membershipData,
    
    // Upload & Transaction
    isUploading,
    
    // Upload function
    uploadFiles,
    
    // Reset
    resetAll,
  } = useDesignPublisherForm();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetAll();
    };
  }, [resetAll]);

  // 驗證發布條件
  const validatePublish = useCallback(() => {
    const errors: string[] = [];
    
    if (!imageFile) errors.push('Cover image is required');
    if (!algoFile) errors.push('Algorithm file is required');
    if (!artworkInfo.workName.trim()) errors.push('Artwork title is required');
    if (!artworkInfo.description.trim()) errors.push('Description is required');
    if (!artworkInfo.price || parseFloat(artworkInfo.price) < 0) errors.push('Valid price is required');
    
    return errors;
  }, [imageFile, algoFile, artworkInfo.workName, artworkInfo.description, artworkInfo.price]);

  // 計算發布按鈕狀態
  const publishButtonState = useMemo(() => {
    const errors = validatePublish();
    return {
      disabled: errors.length > 0 || isUploading,
      tooltip: errors.length > 0 ? errors[0] : ''
    };
  }, [validatePublish, isUploading]);

  // 發布處理
  const handlePublish = useCallback(async () => {
    const errors = validatePublish();
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return;
    }

    try {
      // 創建 metadata
      const metadata = createMetadataJson({
        workName: artworkInfo.workName,
        description: artworkInfo.description,
        style: designSettings.style,
        fontStyle: designSettings.fontStyle,
        name: artistInfo.name,
        address: currentAccount?.address || '',
        intro: artistInfo.intro,
        membershipData: membershipData,
        extractedParameters: extractedParameters
      });
      
      // 觸發上傳流程
      if (imageFile && algoFile && uploadFiles) {
        uploadFiles(imageFile, algoFile, metadata);
      }
    } catch (error) {
      console.error('Publish error:', error);
    }
  }, [validatePublish, imageFile, algoFile, artworkInfo, designSettings, artistInfo, currentAccount, membershipData, extractedParameters, uploadFiles]);

  // 轉換 extractedParameters 從 Record 到 Array
  const parametersArray = useMemo(() => {
    const params = Object.entries(extractedParameters).map(([key, param]) => ({
      name: key,
      type: param.type || 'text',
      label: param.label || key,
      min: param.min,
      max: param.max,
      default: param.default
    }));
    console.log('[Publisher] Extracted parameters:', params.length, 'parameters');
    return params;
  }, [extractedParameters]);

  // Debug logs
  useEffect(() => {
    console.log('[Publisher] State update:', {
      hasImageFile: !!imageFile,
      hasImageUrl: !!imageUrl,
      imageUrl: imageUrl?.substring(0, 50),
      hasAlgoFile: !!algoFile,
      algoFileName: algoFile?.name,
      hasUserScript: !!userScript,
      parametersCount: parametersArray.length
    });
  }, [imageFile, imageUrl, algoFile, userScript, parametersArray]);

  return (
    <PublisherMintLayout
      // 藝術家信息
      artistName={membershipData?.username || artistInfo.name || 'Anonymous'}
      artistAddress={currentAccount?.address || ''}
      intro={membershipData?.description || artistInfo.intro || ''}
      
      // Cover Image
      coverImage={imageFile}
      coverImageUrl={imageUrl}
      coverImageRequired={validationState.imageRequired}
      onCoverImageUpload={handleImageFileChange}
      onCoverImageRemove={() => {
        // TODO: 需要添加清除圖片的邏輯
        console.log('Remove cover image');
      }}
      
      // Algorithm File
      algoFile={algoFile}
      algoFileRequired={validationState.algoRequired}
      onAlgoFileUpload={handleAlgoFileChange}
      onAlgoFileRemove={() => {
        // TODO: 需要添加清除算法文件的邏輯
        console.log('Remove algo file');
      }}
      
      // 基本信息
      workName={artworkInfo.workName}
      description={artworkInfo.description}
      price={artworkInfo.price}
      onWorkNameChange={(value) => updateArtworkInfo('workName', value)}
      onDescriptionChange={(value) => updateArtworkInfo('description', value)}
      onPriceChange={handlePriceChange}
      
      // 提取的參數（轉換為陣列）
      extractedParameters={parametersArray}
      
      // 3D 預覽
      preview3D={
        userScript && algoFile ? (
          <div className="w-full h-full">
            <ParametricViewer
              key={`${algoFile.name}-${Date.now()}`}
              userScript={userScript}
              parameters={previewParams}
            />
          </div>
        ) : undefined
      }
      
      // 發布
      onPublish={handlePublish}
      publishButtonState={publishButtonState}
      isPublishing={isUploading}
      
      // 驗證錯誤
      workNameError={validationState.workNameRequired ? 'Title is required' : ''}
      descriptionError={validationState.descriptionRequired ? 'Description is required' : ''}
      priceError={validationState.priceError || (validationState.priceRequired ? 'Price is required' : '')}
    />
  );
}
