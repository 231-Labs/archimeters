import { useState, useCallback } from 'react';

interface PageNavigationOptions {
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function usePageNavigation({ totalPages, onPageChange }: PageNavigationOptions) {
  const [currentPage, setCurrentPage] = useState(1);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      onPageChange?.(nextPage);
    }
  }, [currentPage, totalPages, onPageChange]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      onPageChange?.(prevPage);
    }
  }, [currentPage, onPageChange]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      onPageChange?.(page);
    }
  }, [totalPages, onPageChange]);

  const resetNavigation = useCallback(() => {
    setCurrentPage(1);
    onPageChange?.(1);
  }, [onPageChange]);

  return {
    currentPage,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    resetNavigation,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  };
}

