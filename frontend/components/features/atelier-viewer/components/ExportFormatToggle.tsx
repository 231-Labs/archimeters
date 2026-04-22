interface StlToggleProps {
  generateStl: boolean;
  onToggle: () => void;
}

/**
 * STL Toggle - Control whether to generate encrypted STL file for printing
 * GLB is always generated for 3D preview
 */
export const StlToggle = ({ generateStl, onToggle }: StlToggleProps) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-light text-muted-foreground tracking-wide">Generate STL</span>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2"
        title={`${generateStl ? 'Disable' : 'Enable'} STL generation for printing`}
      >
        <div
          className={`w-8 h-3 rounded-sm transition-all ${
            generateStl ? 'bg-green-500/40' : 'bg-foreground/15'
          }`}
        >
          <div
            className={`w-3 h-2.5 rounded-[1px] transition-all ${
              generateStl ? 'bg-green-500 dark:bg-green-400 translate-x-4' : 'bg-foreground/50 translate-x-0.5'
            }`}
          />
        </div>
        <span
          className={`text-[10px] font-mono font-bold min-w-[30px] tracking-wider ${
            generateStl ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
          }`}
        >
          {generateStl ? 'ON' : 'OFF'}
        </span>
      </button>
      {generateStl && (
        <span className="text-[9px] text-green-600/70 dark:text-green-400/60 font-mono">🔐 ENCRYPTED</span>
      )}
    </div>
  );
};

