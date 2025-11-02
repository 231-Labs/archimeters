interface NavigationButtonsProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
}

export const NavigationButtons = ({
  currentPage,
  totalPages,
  onNext,
  onPrevious,
}: NavigationButtonsProps) => {
  const showPreviousButton = currentPage > 1 && currentPage < totalPages;
  const showNextButton = currentPage < totalPages - 1; // Don't show on last two pages
  const showSubmitButton = currentPage === totalPages - 1; // Show on preview page

  return (
    <div className="fixed bottom-6 right-6 flex gap-2 z-20">
      {showPreviousButton && (
        <button 
          onClick={onPrevious}
          className="group relative w-10 h-10 flex items-center justify-center bg-transparent backdrop-blur-sm"
        >
          <div className="absolute inset-0 border border-white/10 rotate-45 group-hover:border-white/20 transition-colors" />
          <div className="absolute inset-[1px] bg-[rgba(20,20,20,0.8)] rotate-45 group-hover:bg-[rgba(30,30,30,0.8)] transition-colors" />
          <span className="relative text-sm text-white/70 group-hover:text-white/90 transition-colors">←</span>
        </button>
      )}
      {showNextButton && (
        <button 
          onClick={onNext}
          className="group relative w-10 h-10 flex items-center justify-center bg-transparent backdrop-blur-sm"
        >
          <div className="absolute inset-0 border border-white/10 rotate-45 group-hover:border-white/20 transition-colors" />
          <div className="absolute inset-[1px] bg-[rgba(20,20,20,0.8)] rotate-45 group-hover:bg-[rgba(30,30,30,0.8)] transition-colors" />
          <span className="relative text-sm text-white/70 group-hover:text-white/90 transition-colors">→</span>
        </button>
      )}
      {showSubmitButton && (
        <button 
          onClick={onNext}
          className="group relative w-10 h-10 flex items-center justify-center bg-transparent backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-white/5 rounded-sm group-hover:bg-white/10 transition-all duration-300"></div>
          <div className="absolute inset-0 border border-white/20 rotate-45 group-hover:border-white/30 transition-colors"></div>
          <div className="absolute inset-[1px] bg-[rgba(20,20,20,0.8)] rotate-45 group-hover:bg-[rgba(30,30,30,0.8)] transition-colors"></div>
          <span className="relative text-sm text-white/80 group-hover:text-white transition-colors">✓</span>
        </button>
      )}
    </div>
  );
};

