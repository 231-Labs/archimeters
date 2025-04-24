import { useState, useCallback } from 'react';
import type { ValidationState } from '../types';

const defaultValidationState: ValidationState = {
  workNameRequired: false,
  descriptionRequired: false,
  priceRequired: false,
  introRequired: false,
  priceError: '',
  imageRequired: false,
  algoRequired: false,
};

export function useValidation() {
  const [validationState, setValidationState] = useState<ValidationState>(defaultValidationState);

  const validatePrice = useCallback((price: string) => {
    if (!price) {
      setValidationState(prev => ({
        ...prev,
        priceRequired: true,
        priceError: 'Price is required',
      }));
      return false;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setValidationState(prev => ({
        ...prev,
        priceError: 'Please enter a valid price',
      }));
      return false;
    }

    setValidationState(prev => ({
      ...prev,
      priceRequired: false,
      priceError: '',
    }));
    return true;
  }, []);

  const validateForm = useCallback((formData: any) => {
    const {
      workName,
      description,
      price,
      intro,
      imageFile,
      algoFile,
    } = formData;

    const newValidationState = {
      workNameRequired: !workName,
      descriptionRequired: !description,
      priceRequired: !price,
      introRequired: !intro,
      priceError: '',
      imageRequired: !imageFile,
      algoRequired: !algoFile,
    };

    setValidationState(newValidationState);

    return !Object.values(newValidationState).some(Boolean);
  }, []);

  const resetValidation = useCallback(() => {
    setValidationState(defaultValidationState);
  }, []);

  return {
    validationState,
    validatePrice,
    validateForm,
    resetValidation,
  };
}