export const windowStyles = {
  container: 'absolute flex flex-col window-shadow retro-border bg-[#0a0a0a]',
  active: 'z-50',
  inactive: 'z-0',
  titleBar: 'h-6 px-2 flex items-center justify-between border-b border-[rgba(255,255,255,0.2)] bg-[#141414]',
  title: 'text-xs font-mono text-white font-bold',
  closeButton: 'w-4 h-4 flex items-center justify-center text-xs border border-[rgba(255,255,255,0.2)] hover:bg-white/20 hover:border-white/40 text-white transition-colors',
  content: 'flex-1 overflow-hidden',
  resizeHandle: {
    container: 'absolute bottom-0 right-0 w-6 h-6 cursor-se-resize group',
    line1: 'absolute bottom-0 right-0 w-4 h-4 border-l border-t border-[rgba(255,255,255,0.3)] group-hover:border-[rgba(255,255,255,0.6)]',
    line2: 'absolute bottom-1 right-1 w-2 h-2 border-l border-t border-[rgba(255,255,255,0.3)] group-hover:border-[rgba(255,255,255,0.6)]',
    line3: 'absolute bottom-2 right-2 w-1 h-1 border-l border-t border-[rgba(255,255,255,0.3)] group-hover:border-[rgba(255,255,255,0.6)]'
  }
} as const; 