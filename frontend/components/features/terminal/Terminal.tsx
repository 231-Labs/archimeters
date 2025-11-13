'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useRef, useState } from 'react';
import type { Terminal as XTerm } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';
import { TERMINAL_THEME, terminalStyles } from './styles/theme';
import { writeLine } from './utils';
import { COLORS } from './constants/colors';
import { BOX_STYLES }  from './styles/borders';
import '@xterm/xterm/css/xterm.css';
import { geometryDocLines } from './files/geometryDocLines';
import { algorithmFile } from './files/algorithmfile';
import { intoduction } from './files/introduction';
import { creditsSection } from './files/credits';
import { summary } from './files/howtouse';
import { archimeters } from './files/archimeters';
import { Color } from 'three';

const DOCS = [ 
  { name: 'How to use', title: 'Archimeters Summary', content: summary },
  { name: 'Design Guide', title: 'Geometry Parameters Design Guide', content: geometryDocLines },
  { name: 'Design Example', title: 'Geometry Parameters Design Example File', content: algorithmFile },
];

const ArchimetersTerminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<XTerm | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const inputBuffer = useRef<string>('');
  const initialized = useRef<boolean>(false);
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    if (!terminalRef.current || typeof window === 'undefined' || initialized.current) return;
    initialized.current = true;

    const initializeTerminal = async () => {
      try {
        const [xtermModule, fitAddonModule] = await Promise.all([
          import('@xterm/xterm'),
          import('@xterm/addon-fit')
        ]);
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
        lineHeight: 1.5,
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

      // Scroll to bottom
      const scrollToBottom = () => {
        if (terminal.current) {
          terminal.current.scrollToBottom();
        }
      };

      const printLines = (lines: string[], cb: () => void) => {
        let idx = 0;
        const printNext = () => {
          if (idx < lines.length) {
            writeLine(terminal.current, lines[idx++], COLORS.DEFAULT);
            scrollToBottom();
            setTimeout(printNext, 10);
          } else cb();
        };
        printNext();
      };

      // Print TUI style content
      writeLine(terminal.current, '', COLORS.DEFAULT);
      writeLine(terminal.current, '✨  ARCHIMETERS TERMINAL', COLORS.green);
      writeLine(terminal.current, BOX_STYLES.separator, COLORS.pink);
      writeLine(terminal.current, `🪐  Wallet: ${currentAccount?.address || 'Not Connected'}`, COLORS.orange);
      writeLine(terminal.current, BOX_STYLES.separator, COLORS.pink);
      writeLine(terminal.current, '📖  Available Commands:', COLORS.pink);
      writeLine(terminal.current, '  🌌  archimeters       story and vision', COLORS.DEFAULT);
      writeLine(terminal.current, '  📌  guide             List all documents', COLORS.DEFAULT);
      writeLine(terminal.current, '  📝  read <Number>     Read Guide document', COLORS.DEFAULT);
      writeLine(terminal.current, '  👥  231labs           our team and story', COLORS.DEFAULT);
      writeLine(terminal.current, '  ⭐  credits           API Reference', COLORS.DEFAULT);
      writeLine(terminal.current, '  🧹  clear             Clear terminal', COLORS.DEFAULT);
      writeLine(terminal.current, BOX_STYLES.separator, COLORS.pink);
      showPrompt();

      // Handle input
      const handleData = (data: string) => {
        if (data.length > 1) {
          inputBuffer.current += data;
          terminal.current?.write(data);
          return;
        }
        if (data === '\r') { // Enter key
          terminal.current?.writeln('');
          const command = inputBuffer.current.trim();
          if (command === 'archimeters') {
            printLines(archimeters, showPrompt);

          } else if (command === 'guide') {
            writeLine(terminal.current, '📄  FileNumber', COLORS.pink);
            const num = 0;
            DOCS.forEach((d, num) => writeLine(terminal.current, `   ${num + 1}. ${d.name.padEnd(16)} - ${d.title}`, COLORS.DEFAULT));
            writeLine(terminal.current, '👉  usage example: \x1b[38;2;128;255;255mread 1 \x1B[0m', COLORS.pink);
            writeLine(terminal.current, '', COLORS.DEFAULT);
            showPrompt();

          } else if (command === 'credits') {
            printLines(creditsSection, showPrompt);

          } else if (/^read \d+$/.test(command)) {
            const index = parseInt(command.split(' ')[1], 10);
            const doc = DOCS[index - 1];
            if (doc) {
              printLines(doc.content, showPrompt);
            }

          } else if (command === '231labs') {
            printLines(intoduction, showPrompt);

          }else if (command === 'clear') {
            terminal.current?.clear();
            writeLine(terminal.current, '', COLORS.DEFAULT);
            writeLine(terminal.current, '✨  ARCHIMETERS TERMINAL', COLORS.green);
            writeLine(terminal.current, BOX_STYLES.separator, COLORS.pink);
            writeLine(terminal.current, `🪐  Wallet: ${currentAccount?.address || 'Not Connected'}`, COLORS.orange);
            writeLine(terminal.current, BOX_STYLES.separator, COLORS.pink);
            writeLine(terminal.current, '📖  Available Commands:', COLORS.pink);
            writeLine(terminal.current, '  🌌  Archimeters       story and vision', COLORS.DEFAULT);
            writeLine(terminal.current, '  📌  guide             List all documents', COLORS.DEFAULT);
            writeLine(terminal.current, '  📝  read <Number>     Read Guide document', COLORS.DEFAULT);
            writeLine(terminal.current, '  👥  231labs           our team and story', COLORS.DEFAULT);
            writeLine(terminal.current, '  ⭐  credits           API Reference', COLORS.DEFAULT);
            writeLine(terminal.current, '  🧹  clear             Clear terminal', COLORS.DEFAULT);
            writeLine(terminal.current, BOX_STYLES.separator, COLORS.pink);
            showPrompt();
          } else if (command) {
            writeLine(terminal.current, `❌ ERROR: Unknown command: ${command}`, COLORS.ERROR);
            writeLine(terminal.current, '', COLORS.DEFAULT);
            showPrompt();
          }
          inputBuffer.current = '';
          // showPrompt();
        } else if (data === '\u007f') {  // backspace
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
        return () => {
          window.removeEventListener('resize', handleResize);
          terminal.current?.dispose();
          styleSheet.remove();
        };
      } catch (error) {
        console.error('Failed to initialize terminal:', error);
        // Show error message to user
        if (terminalRef.current) {
          terminalRef.current.innerHTML = `
            <div style="color: #ff6b6b; padding: 20px; font-family: monospace;">
              ❌ Terminal failed to load<br/>
              Please refresh the page or contact support
            </div>
          `;
        }
      }
    };
    initializeTerminal();
  }, [currentAccount]);

  useEffect(() => {
    if (!terminal.current) return;
    terminal.current.write('\x1B[2K\r');
    terminal.current.write('\x1B[1A');
    terminal.current.write('\x1B[2K\r');
    writeLine(terminal.current, BOX_STYLES.separator, COLORS.pink);
    writeLine(terminal.current, `🪐 Wallet: ${currentAccount?.address || 'Not Connected'}`, COLORS.orange);
    writeLine(terminal.current, BOX_STYLES.separator, COLORS.pink);
    showPrompt();
  }, [currentAccount]);

  const showPrompt = () => {
    terminal.current?.write('\x1B[38;2;255;194;224m> \x1B[0m');
  };

  return (
    <div
      ref={terminalRef}
      className="h-full w-full overflow-hidden font-mono"
      style={{
        background: 'linear-gradient(to right, #0a0a0a, #111111, #161616)',
      }}
    />
  );
};

export default ArchimetersTerminal; 