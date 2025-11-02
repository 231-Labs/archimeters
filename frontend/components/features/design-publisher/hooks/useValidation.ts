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
    // Allow 0 and positive numbers including decimals
    if (isNaN(numericPrice) || numericPrice < 0) {
      setValidationState(prev => ({
        ...prev,
        priceError: 'Please enter a valid price (0 or positive number)',
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

    // Check if price is valid (allow 0, but not empty string)
    const isPriceValid = price !== '' && price !== null && price !== undefined;
    const numericPrice = Number(price);
    const hasPriceError = !isPriceValid || isNaN(numericPrice) || numericPrice < 0;

    const newValidationState = {
      workNameRequired: !workName,
      descriptionRequired: !description,
      priceRequired: !isPriceValid,
      introRequired: !intro,
      priceError: hasPriceError ? 'Please enter a valid price (0 or positive number)' : '',
      imageRequired: !imageFile,
      algoRequired: algoFile !== null ? !algoFile : false, // Only check if algoFile is expected
    };

    setValidationState(newValidationState);

    // Filter out falsy values and empty strings for validation check
    const validationErrors = Object.entries(newValidationState).filter(([key, value]) => {
      if (typeof value === 'string') {
        return value !== ''; // String errors count if non-empty
      }
      return value === true; // Boolean errors count if true
    });

    return validationErrors.length === 0;
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