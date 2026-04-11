export const TERMINAL_THEME_DARK = {
  background: '#1a1a1a',
  foreground: '#c9d1d9',
  cursor: '#FFC1E0',
  cursorAccent: '#1a1a1a',
  selection: 'rgba(255, 194, 224, 0.45)',
  black: '#181c20',
  red: '#e06c75',
  green: '#98c379',
  yellow: '#e5c07b',
  blue: '#61afef',
  magenta: '#c678dd',
  cyan: '#56b6c2',
  white: '#c9d1d9',
} as const;

/** Light mode: pale surface, readable retro terminal hues */
export const TERMINAL_THEME_LIGHT = {
  background: '#f0eee8',
  foreground: '#2a2d32',
  cursor: '#7a3d5c',
  cursorAccent: '#f6f4ee',
  selection: 'rgba(60, 50, 90, 0.2)',
  black: '#e8e6e0',
  red: '#b8323a',
  green: '#2d6a4f',
  yellow: '#8a6a1f',
  blue: '#2a5f9e',
  magenta: '#7a3d8a',
  cyan: '#0f6f7a',
  white: '#2a2d32',
} as const;

export function getTerminalTheme(mode: 'light' | 'dark') {
  return mode === 'light' ? TERMINAL_THEME_LIGHT : TERMINAL_THEME_DARK;
}

export function getTerminalDomStyles(mode: 'light' | 'dark') {
  const bg = mode === 'light' ? '#f0eee8' : '#1a1a1a';
  const track = mode === 'light' ? '#e4e2dc' : '#1a1a1a';
  return {
    '.xterm': {
      'font-family': 'JetBrains Mono, monospace',
      'font-size': '14px',
      'line-height': '1.2',
      'padding-right': '5px',
      'padding-left': '25px',
      'background-color': bg,
      border: `0px solid ${bg}`,
      'border-radius': '8px',
    },
    '.xterm-viewport': {
      'scrollbar-color': `${track} ${track}`,
    },
  } as const;
}

/** @deprecated Use getTerminalTheme("dark") */
export const TERMINAL_THEME = TERMINAL_THEME_DARK;

export const terminalStyles = getTerminalDomStyles('dark');
