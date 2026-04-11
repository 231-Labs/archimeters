/** SGR parameters (no ESC) for `writeLine` → `\x1B[${color}m` */
export const COLORS_DARK = {
  DEFAULT: '1;37',
  ERROR: '1;31',
  SUCCESS: '1;32',
  WARNING: '1;33',
  INFO: '1;34',
  ACCENT: '1;36',
  pink: '38;2;255;194;224',
  green: '38;2;128;255;255',
  orange: '38;2;255;199;143',
  purple: '38;2;176;92;255',
} as const;

export const COLORS_LIGHT = {
  DEFAULT: '38;2;42;46;54',
  ERROR: '38;2;185;45;52',
  SUCCESS: '38;2;35;115;65',
  WARNING: '38;2;145;100;30',
  INFO: '38;2;45;95;155',
  ACCENT: '38;2;15;115;125',
  pink: '38;2;125;72;108',
  green: '38;2;0;125;138',
  orange: '38;2;145;92;38',
  purple: '38;2;100;62;150',
} as const;

export type TerminalPalette = typeof COLORS_DARK | typeof COLORS_LIGHT;

export function getTerminalColors(mode: 'light' | 'dark'): TerminalPalette {
  return mode === 'light' ? COLORS_LIGHT : COLORS_DARK;
}

/** Default export for legacy callers (dark palette) */
export const COLORS = COLORS_DARK;
