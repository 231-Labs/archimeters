export const scaleSuiPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseInt(price) : price;
  const scaled = numPrice / 1_000_000_000;
  // Format to remove trailing zeros, keep reasonable precision
  return scaled.toFixed(9).replace(/\.?0+$/, '');
};

export const formatAddress = (address: string): string => {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
};

export const formatText = (text: string): string => {
  return text ? text.replace(/\n/g, '\n') : '';
};

