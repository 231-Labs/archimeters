'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useRef, useState } from 'react';
import type { Terminal as XTerm } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';
import { TERMINAL_THEME, terminalStyles } from './styles/theme';
import { writeLine } from './utils';
import { COLORS } from './constants/colors';
import DocumentViewer from './DocumentViewer';
import { BOX_STYLES }  from './styles/borders';
import '@xterm/xterm/css/xterm.css';

const DOCS = [
  { name: 'readme', title: 'README.md', content: 'This is the project README.\n...\n' },
  { name: 'guide', title: 'Upload format Guide', content: 'This is the upload format giude guide.\n...\n' },
  { name: 'credits', title: 'API Reference', content: 'This is the credits documentation.\n...\n' },
  { name: '231lab', title: 'About 231 Lab', content: 'We are a team of three passionate developers from the 231 Lab at Feng Chia University. \nWith a shared interest in innovation and technology, we joined this hackathon to challenge ourselves and turn creative ideas into real solutions. \nEach member brings unique skills to the table, and together we strive to build impactful projects through collaboration and dedication.\n' },
];
const TEAM = [
  { name: 'Alice', role: 'Product Manager', contact: 'alice@example.com' },
  { name: 'Bob', role: 'Frontend Engineer', contact: 'bob@example.com' },
  { name: 'Carol', role: 'Designer', contact: 'carol@example.com' },
];

const ArchimetersTerminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<XTerm | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const inputBuffer = useRef<string>('');
  const initialized = useRef<boolean>(false);
  const currentAccount = useCurrentAccount();
  const [isViewingDoc, setIsViewingDoc] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<{ content: string; title: string } | null>(null);

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

      // Print TUI style content
      writeLine(terminal.current, '', COLORS.DEFAULT);
      writeLine(terminal.current, '✨  ARCHIMETERS TERMINAL', COLORS.INFO);
      writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
      writeLine(terminal.current, `🪐  Wallet: ${currentAccount?.address || 'Not Connected'}`, COLORS.ACCENT);
      writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
      writeLine(terminal.current, '📖  Available Commands:', COLORS.DEFAULT);
      writeLine(terminal.current, '  📄  docs         List all documents', COLORS.DEFAULT);
      writeLine(terminal.current, '  👥  team         Show team members', COLORS.DEFAULT);
      writeLine(terminal.current, '  📑  read <name>  Read document', COLORS.DEFAULT);
      writeLine(terminal.current, '  🧹  clear        Clear terminal', COLORS.DEFAULT);
      writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
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
          if (command === 'docs') {
            writeLine(terminal.current, '📄 DOCUMENTS', COLORS.INFO);
            DOCS.forEach(d => writeLine(terminal.current, `  ${d.name.padEnd(10)} - ${d.title}`, COLORS.INFO));
            writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
          } else if (command === 'team') {
            writeLine(terminal.current, '👥 TEAM', COLORS.INFO);
            TEAM.forEach(m => writeLine(terminal.current, `  ${m.name.padEnd(12)} | ${m.role.padEnd(18)} | ${m.contact}`, COLORS.INFO));
            writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
          } else if (command.startsWith('read ')) {
            const docName = command.slice(5);
            const doc = DOCS.find(d => d.name === docName);
            if (doc) {
              // setCurrentDoc({ content: doc.content, title: doc.title });
              // setIsViewingDoc(true);
              const lines = doc.content.split('\n');
              lines.forEach(line => writeLine(terminal.current, line, COLORS.DEFAULT));
              writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
            } else {
              writeLine(terminal.current, `❌ ERROR: Document not found: ${docName}`, COLORS.ERROR);
              writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
            }
          } else if (command === 'clear') {
            terminal.current?.clear();
            writeLine(terminal.current, '', COLORS.DEFAULT);
            writeLine(terminal.current, '✨ ARCHIMETERS TERMINAL', COLORS.INFO);
            writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
            writeLine(terminal.current, `🪐 Wallet: ${currentAccount?.address || 'Not Connected'}`, COLORS.ACCENT);
            writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
            writeLine(terminal.current, '📖 Available Commands:', COLORS.DEFAULT);
            writeLine(terminal.current, '  📄 docs         List all documents', COLORS.DEFAULT);
            writeLine(terminal.current, '  👥 team         Show team members', COLORS.DEFAULT);
            writeLine(terminal.current, '  📑 read <name>  Read document', COLORS.DEFAULT);
            writeLine(terminal.current, '  🧹 clear        Clear terminal', COLORS.DEFAULT);
            writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
          } else if (command) {
            writeLine(terminal.current, `❌ ERROR: Unknown command: ${command}`, COLORS.ERROR);
            writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
          }
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
      return () => {
        window.removeEventListener('resize', handleResize);
        terminal.current?.dispose();
        styleSheet.remove();
      };
    };
    initializeTerminal();
  }, [currentAccount]);

  useEffect(() => {
    if (!terminal.current) return;
    terminal.current.write('\x1B[2K\r');
    terminal.current.write('\x1B[1A');
    terminal.current.write('\x1B[2K\r');
    writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
    writeLine(terminal.current, `🪐 Wallet: ${currentAccount?.address || 'Not Connected'}`, COLORS.ACCENT);
    writeLine(terminal.current, BOX_STYLES.separator, COLORS.INFO);
    showPrompt();
  }, [currentAccount]);

  const showPrompt = () => {
    terminal.current?.write('\x1B[1;34m> \x1B[0m');
  };

  if (isViewingDoc && currentDoc) {
    return (
      <div className="h-full w-full overflow-hidden bg-black font-mono" style={{ padding: '1rem' }}>
        <DocumentViewer content={currentDoc.content} title={currentDoc.title} />
      </div>
    );
  }

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

export default ArchimetersTerminal; 