import { TemplateSeries, FontStyle } from '../../../types';

interface DesignSettingsProps {
  style: TemplateSeries;
  fontStyle: FontStyle;
  onStyleChange: (style: TemplateSeries) => void;
  onFontStyleChange: (style: FontStyle) => void;
}

export const DesignSettings = ({
  style,
  fontStyle,
  onStyleChange,
  onFontStyleChange
}: DesignSettingsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-white/60 text-sm block mb-2">Page Style</label>
        <select
          disabled
          value={style}
          onChange={(e) => onStyleChange(e.target.value as TemplateSeries)}
          className="w-full bg-transparent text-white/30 border-b border-white/10 pb-2 cursor-not-allowed opacity-80"
        >
          <option value="default">Default</option>
          <option value="minimal">Minimal</option>
          <option value="elegant">Elegant</option>
        </select>
      </div>

      <div>
        <label className="text-white/60 text-sm block mb-2">Font Style</label>
        <select
          disabled
          value={fontStyle}
          onChange={(e) => onFontStyleChange(e.target.value as FontStyle)}
          className="w-full bg-transparent text-white/30 border-b border-white/10 pb-2 cursor-not-allowed opacity-80"
        >
          <option value="sans">Sans Serif</option>
          <option value="serif">Serif</option>
          <option value="mono">Monospace</option>
        </select>
      </div>
    </div>
  );
};

