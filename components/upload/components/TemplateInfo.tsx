import { TemplateSeries, FontStyle } from '../types';
import { templateSeries } from '../utils/templateConfig';

interface TemplateInfoProps {
  style: TemplateSeries;
  fontStyle: FontStyle;
}

export const TemplateInfo = ({ style, fontStyle }: TemplateInfoProps) => {
  return (
    <div className="bg-white/5 p-4 rounded-lg space-y-3">
      <div className="text-white/50 text-sm">Template Information</div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-white/40 text-xs">Series</div>
          <div className="text-white/90 capitalize">{templateSeries[style].name}</div>
        </div>
        <div>
          <div className="text-white/40 text-xs">Font Style</div>
          <div className="text-white/90 capitalize">{fontStyle}</div>
        </div>
      </div>
      <div>
        <div className="text-white/40 text-xs mt-2">Description</div>
        <div className="text-white/60 text-sm">{templateSeries[style].description}</div>
      </div>
    </div>
  );
}; 