'use client';

import { useCurrentAccount } from '@mysten/dapp-kit-react';
import { useEffect, useMemo, useRef } from 'react';
import type { Terminal as XTerm } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';
import { getTerminalDomStyles, getTerminalTheme } from './styles/theme';
import { writeLine } from './utils';
import { getTerminalColors, type TerminalPalette } from './constants/colors';
import { BOX_STYLES } from './styles/borders';
import '@xterm/xterm/css/xterm.css';
import { geometryDocLines } from './files/geometryDocLines';
import { algorithmFile } from './files/algorithmfile';
import { intoduction } from './files/introduction';
import { creditsSection } from './files/credits';
import { summary } from './files/howtouse';
import { archimeters } from './files/archimeters';
import { useDataTheme } from '@/hooks/useDataTheme';

const DOCS = [
  { name: 'How to use', title: 'Archimeters Summary', content: summary },
  { name: 'Design Guide', title: 'Geometry Parameters Design Guide', content: geometryDocLines },
  { name: 'Design Example', title: 'Geometry Parameters Design Example File', content: algorithmFile },
];

function printWelcome(terminal: XTerm | null, colors: TerminalPalette, walletDisplay: string) {
  writeLine(terminal, '', colors.DEFAULT);
  writeLine(terminal, '✨  ARCHIMETERS TERMINAL', colors.green);
  writeLine(terminal, BOX_STYLES.separator, colors.pink);
  writeLine(terminal, `🪐  Wallet: ${walletDisplay}`, colors.orange);
  writeLine(terminal, BOX_STYLES.separator, colors.pink);
  writeLine(terminal, '📖  Available Commands:', colors.pink);
  writeLine(terminal, '  🌌  archimeters       story and vision', colors.DEFAULT);
  writeLine(terminal, '  📌  guide             List all documents', colors.DEFAULT);
  writeLine(terminal, '  📝  read <Number>     Read Guide document', colors.DEFAULT);
  writeLine(terminal, '  👥  231labs           our team and story', colors.DEFAULT);
  writeLine(terminal, '  ⭐  credits           API Reference', colors.DEFAULT);
  writeLine(terminal, '  🧹  clear             Clear terminal', colors.DEFAULT);
  writeLine(terminal, BOX_STYLES.separator, colors.pink);
}

function showPrompt(terminal: XTerm | null, colors: TerminalPalette) {
  terminal?.write(`\x1B[${colors.pink}m> \x1B[0m`);
}

const ArchimetersTerminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<XTerm | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const inputBuffer = useRef<string>('');
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const currentAccount = useCurrentAccount();
  const dataTheme = useDataTheme();
  const colors = useMemo(() => getTerminalColors(dataTheme), [dataTheme]);
  const walletDisplay = currentAccount?.address || 'Not Connected';

  useEffect(() => {
    if (!terminalRef.current || typeof window === 'undefined') return;

    let disposed = false;
    const styleSheet = document.createElement('style');
    styleSheet.setAttribute('data-archimeters-xterm', '1');
    styleSheet.textContent = Object.entries(getTerminalDomStyles(dataTheme))
      .map(([selector, rules]) => {
        const cssRules = Object.entries(rules)
          .map(([property, value]) => `${property}: ${value};`)
          .join(' ');
        return `${selector} { ${cssRules} }`;
      })
      .join('\n');
    document.head.appendChild(styleSheet);

    document.querySelectorAll('style[data-archimeters-xterm]').forEach((el) => {
      if (el !== styleSheet) el.remove();
    });

    const palette = colors;
    const themeMode = dataTheme;

    const boot = async () => {
      try {
        const [xtermModule, fitAddonModule] = await Promise.all([
          import('@xterm/xterm'),
          import('@xterm/addon-fit'),
        ]);
        if (disposed || !terminalRef.current) return;

        const Terminal = xtermModule.Terminal;
        const FitAddon = fitAddonModule.FitAddon;

        terminal.current?.dispose();
        fitAddon.current = null;

        const term = new Terminal({
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 14,
          lineHeight: 1.5,
          theme: { ...getTerminalTheme(themeMode) },
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

        if (disposed || !terminalRef.current) {
          term.dispose();
          return;
        }

        const fit = new FitAddon();
        term.loadAddon(fit);
        terminal.current = term;
        fitAddon.current = fit;

        term.open(terminalRef.current);
        term.focus();

        setTimeout(() => {
          if (!disposed && fitAddon.current) {
            try {
              fitAddon.current.fit();
            } catch (e) {
              console.error('Failed to fit terminal:', e);
            }
          }
        }, 0);

        const scrollToBottom = () => {
          term.scrollToBottom();
        };

        const printLines = (lines: string[], cb: () => void) => {
          let idx = 0;
          const printNext = () => {
            if (idx < lines.length) {
              writeLine(term, lines[idx++], palette.DEFAULT);
              scrollToBottom();
              setTimeout(printNext, 10);
            } else cb();
          };
          printNext();
        };

        printWelcome(term, palette, walletDisplay);
        showPrompt(term, palette);

        const handleData = (data: string) => {
          if (data.length > 1) {
            inputBuffer.current += data;
            term.write(data);
            return;
          }
          if (data === '\r') {
            term.writeln('');
            const command = inputBuffer.current.trim();
            if (command === 'archimeters') {
              printLines(archimeters, () => showPrompt(term, palette));
            } else if (command === 'guide') {
              writeLine(term, '📄  FileNumber', palette.pink);
              DOCS.forEach((d, num) =>
                writeLine(term, `   ${num + 1}. ${d.name.padEnd(16)} - ${d.title}`, palette.DEFAULT)
              );
              writeLine(
                term,
                `👉  usage example: \x1B[${palette.green}mread 1 \x1B[0m`,
                palette.pink
              );
              writeLine(term, '', palette.DEFAULT);
              showPrompt(term, palette);
            } else if (command === 'credits') {
              printLines(creditsSection, () => showPrompt(term, palette));
            } else if (/^read \d+$/.test(command)) {
              const index = parseInt(command.split(' ')[1], 10);
              const doc = DOCS[index - 1];
              if (doc) {
                printLines(doc.content, () => showPrompt(term, palette));
              } else {
                showPrompt(term, palette);
              }
            } else if (command === '231labs') {
              printLines(intoduction, () => showPrompt(term, palette));
            } else if (command === 'clear') {
              term.clear();
              printWelcome(term, palette, walletDisplay);
              showPrompt(term, palette);
            } else if (command) {
              writeLine(term, `❌ ERROR: Unknown command: ${command}`, palette.ERROR);
              writeLine(term, '', palette.DEFAULT);
              showPrompt(term, palette);
            } else {
              showPrompt(term, palette);
            }
            inputBuffer.current = '';
          } else if (data === '\u007f') {
            if (inputBuffer.current.length > 0) {
              inputBuffer.current = inputBuffer.current.slice(0, -1);
              term.write('\b \b');
            }
          } else {
            inputBuffer.current += data;
            term.write(data);
          }
        };

        term.onData(handleData);

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
        resizeHandlerRef.current = handleResize;
      } catch (error) {
        console.error('Failed to initialize terminal:', error);
        if (terminalRef.current) {
          terminalRef.current.innerHTML = `
            <div class="p-5 font-mono text-red-600 dark:text-red-400">
              ❌ Terminal failed to load<br/>
              Please refresh the page or contact support
            </div>
          `;
        }
      }
    };

    void boot();

    return () => {
      disposed = true;
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
      terminal.current?.dispose();
      terminal.current = null;
      fitAddon.current = null;
      styleSheet.remove();
      inputBuffer.current = '';
    };
  }, [dataTheme, colors, walletDisplay]);

  const shellBg =
    dataTheme === 'light'
      ? 'linear-gradient(to right, #f6f4ee, #eeeae4, #e6e2da)'
      : 'linear-gradient(to right, #0a0a0a, #111111, #161616)';

  return (
    <div
      ref={terminalRef}
      className="h-full w-full min-h-[200px] overflow-hidden font-mono"
      style={{ background: shellBg }}
    />
  );
};

export default ArchimetersTerminal;
