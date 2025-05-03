export const TERMINAL_THEME = {
  background: 'transparent',  // 背景
  foreground: '#c9d1d9',  // 前景
  cursor: '#8ab4f8', // 游標
  cursorAccent: '#181c20',  // 游標選取
  selection: 'rgba(138, 180, 248, 0.65)', // 選取文字
  black: '#181c20',
  red: '#e06c75',
  green: '#98c379',
  yellow: '#e5c07b',
  blue: '#61afef',
  magenta: '#c678dd',
  cyan: '#56b6c2',
  white: '#c9d1d9'
};

export const terminalStyles = {
  '.xterm': {
    'font-family': 'JetBrains Mono, monospace',
    'font-size': '14px',
    'line-height': '1.2',
    'padding-right': '25px',
    'padding-left': '20px',
    'background-color': '#181c20',
    'border': '0px solid #181c20',
    'border-radius': '8px',
  },
  '.xterm-viewport': {
    'scrollbar-width': 'thin',
    'scrollbar-color': '#3a4250 #181c20',
    'background-color': '#181c20',
  },
  '.xterm-viewport::-webkit-scrollbar': {
    'width': '8px',
  },
  '.xterm-viewport::-webkit-scrollbar-track': {
    'background': '#181c20',
  },
  '.xterm-viewport::-webkit-scrollbar-thumb': {
    'background-color': '#3a4250',
    'border-radius': '4px',
  }
} as const; 