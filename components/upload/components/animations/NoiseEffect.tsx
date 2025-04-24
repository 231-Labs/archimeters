import { useEffect, useState } from 'react';

interface NoiseEffectProps {
  className?: string;
  size?: number;
  color?: string;
}

export function NoiseEffect({ className = '', size = 4, color = '#ffffff' }: NoiseEffectProps) {
  const [noisePattern, setNoisePattern] = useState('');
  const noiseChars = ['░', '▒', '▓'];

  useEffect(() => {
    const interval = setInterval(() => {
      const pattern = Array(size)
        .fill(0)
        .map(() => noiseChars[Math.floor(Math.random() * noiseChars.length)])
        .join('');
      setNoisePattern(pattern);
    }, 150);

    return () => clearInterval(interval);
  }, [size]);

  return (
    <span 
      className={`inline-block font-mono ${className}`}
      style={{ color, opacity: 0.4 }}
    >
      {noisePattern}
    </span>
  );
} 