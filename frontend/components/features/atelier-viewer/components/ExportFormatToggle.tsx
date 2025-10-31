import { ExportFormat } from '../types';

interface ExportFormatToggleProps {
  exportFormat: ExportFormat;
  onToggle: () => void;
}

export const ExportFormatToggle = ({ exportFormat, onToggle }: ExportFormatToggleProps) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-light text-white/60 tracking-wide">
        Export Format
      </span>
      <button
        onClick={onToggle}
        className="flex items-center gap-2"
        title={`Switch to ${exportFormat === 'glb' ? 'STL' : 'GLB'}`}
      >
        <div className={`w-8 h-3 rounded-sm transition-all ${
          exportFormat === 'glb' ? 'bg-white/30' : 'bg-white/20'
        }`}>
          <div className={`w-3 h-2.5 rounded-[1px] bg-white transition-all ${
            exportFormat === 'glb' ? 'translate-x-0.5' : 'translate-x-4'
          }`} />
        </div>
        <span className="text-[10px] font-mono text-white/90 font-bold min-w-[24px] tracking-wider">
          {exportFormat.toUpperCase()}
        </span>
      </button>
    </div>
  );
};

