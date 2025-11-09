export { formatSuiPrice as scaleSuiPrice, formatAddress } from '@/utils/formatters';

export const formatText = (text: string): string => {
  return text ? text.replace(/\n/g, '\n') : '';
};

