export const TERMINAL_THEME = {
  background: '#0a0a0a',
  foreground: '#ffffff',
  cursor: '#ffffff',
  cursorAccent: '#0a0a0a',
  selection: 'rgba(255, 255, 255, 0.3)',
  black: '#000000',
  red: '#ff3f3f',
  green: '#ffffff',
  yellow: '#ffffff',
  blue: '#e6e6e6',
  magenta: '#f0f0f0',
  cyan: '#ffffff',
  white: '#ffffff',
  brightBlack: '#666666',
  brightRed: '#ff5555',
  brightGreen: '#ffffff',
  brightYellow: '#ffffff',
  brightBlue: '#f0f0f0',
  brightMagenta: '#ffffff',
  brightCyan: '#ffffff',
  brightWhite: '#ffffff'
};

export const terminalStyles = {
  '.xterm-viewport::-webkit-scrollbar': {
    display: 'none',
  },
  '.xterm-viewport': {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  '@font-face': {
    fontFamily: 'JetBrains Mono',
    src: 'url(https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/web/woff2/JetBrainsMono-Regular.woff2) format("woff2")',
    fontWeight: 'normal',
    fontStyle: 'normal',
  },
} as const; 