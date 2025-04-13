'use client';

import { useEffect, useRef } from 'react';
import type { Terminal as XTerm } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';
import { TERMINAL_THEME, terminalStyles } from './styles/theme';
import { GEOMETRIC_BORDER } from './styles/borders';
import { handleCommand } from './commands';
import { drawLogo, writeLine } from './utils';
import { WELCOME_MESSAGES } from './constants/messages';

const ArchimetersTerminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<XTerm | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const inputBuffer = useRef<string>('');
  const initialized = useRef<boolean>(false);

  useEffect(() => {
    if (!terminalRef.current || typeof window === 'undefined' || initialized.current) return;
    initialized.current = true;

    const initializeTerminal = async () => {
      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      require('@xterm/xterm/css/xterm.css');

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
        disableStdin: false,
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
        terminal.current.focus();
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

      // Display welcome messages
      drawLogo(terminal.current);
      writeLine(terminal.current, '', '1;37');
      writeLine(terminal.current, `                         ${WELCOME_MESSAGES.WELCOME}                          `, '1;37');
      writeLine(terminal.current, `                     ${WELCOME_MESSAGES.TAGLINE}                      `, '1;37');
      writeLine(terminal.current, GEOMETRIC_BORDER, '1;34');
      writeLine(terminal.current, '', '1;37');
      writeLine(terminal.current, WELCOME_MESSAGES.HELP_HINT, '1;37');
      writeLine(terminal.current, '', '1;37');
      showPrompt();

      // Handle input
      const handleData = (data: string) => {
        // 處理複製貼上
        if (data.length > 1) {
          inputBuffer.current += data;
          terminal.current?.write(data);
          return;
        }

        if (data === '\r') { // Enter key
          terminal.current?.writeln('');
          handleCommand(terminal.current, inputBuffer.current);
          inputBuffer.current = '';
          showPrompt();
        } else if (data === '\u007f') { // Backspace
          if (inputBuffer.current.length > 0) {
            inputBuffer.current = inputBuffer.current.slice(0, -1);
            terminal.current?.write('\b \b');
          }
        } else {
          inputBuffer.current += data;
          terminal.current?.write(data);
        }
      };

      terminal.current.onData(handleData);

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

      // Return cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        terminal.current?.dispose();
        styleSheet.remove();
      };
    };

    initializeTerminal();
  }, []);

  const showPrompt = () => {
    terminal.current?.write('\x1B[1;37m∆ \x1B[0m');
  };

  return (
    <div 
      ref={terminalRef}
      className="h-full w-full overflow-hidden bg-[#0a0a0a] font-mono"
      style={{
        padding: '0.5rem',
      }}
    />
  );
};

export default ArchimetersTerminal; 