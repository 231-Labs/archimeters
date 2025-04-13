import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
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

  useEffect(() => {
    if (!terminalRef.current) return;

    // 添加自定義樣式
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

    // 初始化終端機
    terminal.current = new XTerm({
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      theme: TERMINAL_THEME,
      cursorBlink: true,
      cursorStyle: 'block',
      allowTransparency: true,
      scrollback: 1000,
      convertEol: true,
    });

    // 初始化適配插件
    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);

    // 掛載終端機
    terminal.current.open(terminalRef.current);
    
    // 確保容器有尺寸後再調整終端機大小
    setTimeout(() => {
      if (fitAddon.current) {
        try {
          fitAddon.current.fit();
        } catch (e) {
          console.error('Failed to fit terminal:', e);
        }
      }
    }, 0);

    // 顯示歡迎訊息
    drawLogo(terminal.current);
    writeLine(terminal.current, '', '1;37');
    writeLine(terminal.current, `                         ${WELCOME_MESSAGES.WELCOME}                          `, '1;37');
    writeLine(terminal.current, `                     ${WELCOME_MESSAGES.TAGLINE}                      `, '1;37');
    writeLine(terminal.current, GEOMETRIC_BORDER, '1;34');
    writeLine(terminal.current, '', '1;37');
    writeLine(terminal.current, WELCOME_MESSAGES.HELP_HINT, '1;37');
    writeLine(terminal.current, '', '1;37');
    showPrompt();

    // 處理輸入
    const handleData = (data: string) => {
      if (data === '\r') { // Enter
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

    // 處理窗口大小變化
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

    // 清理函數
    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.current?.dispose();
      styleSheet.remove();
    };
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