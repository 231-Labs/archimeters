import { useEffect, useRef } from 'react';
import type { Terminal as XTerm } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';
import { TERMINAL_THEME, terminalStyles } from './styles/theme';
import { writeLine } from './utils';
import { COLORS } from './constants/colors';
import '@xterm/xterm/css/xterm.css';

interface DocumentViewerProps {
  content: string;
  title: string;
}

const DocumentViewer = ({ content, title }: DocumentViewerProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<XTerm | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const initialized = useRef<boolean>(false);

  // 捲動到底部
  const scrollToBottom = () => {
    if (terminal.current) {
      // xterm.js 提供 scrollToBottom
      terminal.current.scrollToBottom();
    }
  };

  useEffect(() => {
    if (!terminalRef.current || typeof window === 'undefined' || initialized.current) return;
    initialized.current = true;

    const initializeTerminal = async () => {
      const xtermModule = await import('@xterm/xterm');
      const fitAddonModule = await import('@xterm/addon-fit');
      const Terminal = xtermModule.Terminal;
      const FitAddon = fitAddonModule.FitAddon;

      // Add custom styles
      const styleSheet = document.createElement('style');
      styleSheet.textContent = Object.entries(terminalStyles)
        .map(([selector, rules]) => {
          const cssRules = Object.entries(rules)
            .map(([property, value]) => `${property}: ${value};`)
            .join(' ');
          return `${selector} { ${cssRules} }`;
        })
        .join('\n');
      document.head.appendChild(styleSheet);

      // Initialize terminal
      terminal.current = new Terminal({
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 14,
        lineHeight: 1.2,
        theme: TERMINAL_THEME,
        cursorBlink: true,
        cursorStyle: 'block',
        allowTransparency: true,
        scrollback: 1000,
        convertEol: true,
        disableStdin: true,
        allowProposedApi: true,
        windowsMode: true,
        macOptionIsMeta: true,
        macOptionClickForcesSelection: true,
      });

      // Initialize fit addon
      fitAddon.current = new FitAddon();
      terminal.current.loadAddon(fitAddon.current);

      // Mount terminal
      if (terminalRef.current) {
        terminal.current.open(terminalRef.current);
      }
      
      // Ensure container has dimensions before fitting terminal
      setTimeout(() => {
        if (fitAddon.current) {
          try {
            fitAddon.current.fit();
          } catch (e) {
            console.error('Failed to fit terminal:', e);
          }
        }
      }, 0);

      // Display document header
      writeLine(terminal.current, '╔════════════════════════════════════════════════════════════════════════════╗', COLORS.INFO);
      writeLine(terminal.current, `║ ${title.padEnd(72)} ║`, COLORS.INFO);
      writeLine(terminal.current, '╚════════════════════════════════════════════════════════════════════════════╝', COLORS.INFO);
      writeLine(terminal.current, '', COLORS.DEFAULT);

      // 打字機效果逐行顯示內容，並自動捲動到底部
      const lines = content.split('\n');
      let idx = 0;
      const printNext = () => {
        if (idx < lines.length) {
          writeLine(terminal.current, lines[idx], COLORS.DEFAULT);
          scrollToBottom();
          idx++;
          setTimeout(printNext, 30);
        }
      };
      printNext();

      // Handle window resize
      const handleResize = () => {
        if (fitAddon.current) {
          try {
            fitAddon.current.fit();
          } catch (e) {
            console.error('Failed to fit terminal on resize:', e);
          }
        }
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        terminal.current?.dispose();
        styleSheet.remove();
      };
    };
    initializeTerminal();
  }, [content, title]);

  return (
    <div 
      ref={terminalRef}
      className="h-full w-full overflow-hidden bg-black font-mono"
      style={{
        padding: '1rem',
      }}
    />
  );
};

export default DocumentViewer; 