import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

// 添加自定義樣式
const terminalStyles = {
  '.xterm-viewport::-webkit-scrollbar': {
    display: 'none',
  },
  '.xterm-viewport': {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
} as const;

const ArchimetersTerminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const inputBuffer = useRef<string>('');

  const handleCommand = useCallback((input: string) => {
    const [command, ...args] = input.trim().split(' ');
    
    switch (command) {
      case 'help':
      case '-h':
        terminal.current?.writeln('\x1B[1;36mAvailable commands:\x1B[0m');
        terminal.current?.writeln('  help, -h: Show this help message');
        terminal.current?.writeln('  upload <config> <algorithm>: Upload design series');
        terminal.current?.writeln('  mock <success|failure>: Test upload process');
        break;
      
      case 'upload':
        if (args.length < 2) {
          terminal.current?.writeln('\x1B[1;31mUsage: upload <config_file> <algorithm_file>\x1B[0m');
          break;
        }
        terminal.current?.writeln('\x1B[1;33mUploading design series...\x1B[0m');
        setTimeout(() => {
          terminal.current?.writeln('\x1B[1;32mUpload successful!\x1B[0m');
          terminal.current?.writeln('\x1B[1;36mBlob ID: 0x1234567890abcdef\x1B[0m');
        }, 2000);
        break;

      case 'mock':
        if (args[0] === 'success') {
          terminal.current?.writeln('\x1B[1;32mMock success triggered\x1B[0m');
        } else if (args[0] === 'failure') {
          terminal.current?.writeln('\x1B[1;31mMock failure triggered\x1B[0m');
        } else {
          terminal.current?.writeln('\x1B[1;31mUsage: mock <success|failure>\x1B[0m');
        }
        break;

      default:
        if (command) {
          terminal.current?.writeln(`\x1B[1;31mUnknown command: ${command}\x1B[0m`);
        }
    }
  }, []);

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
    terminal.current = new Terminal({
      theme: {
        background: '#1a1a1a',
        foreground: '#00ff00',
        cursor: '#00ff00',
      },
      fontFamily: 'monospace',
      fontSize: 14,
      cursorBlink: true,
      rows: 24,
      cols: 80,
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
    terminal.current.writeln('\x1B[1;32mWelcome to Archimeters Designer Terminal\x1B[0m');
    terminal.current.writeln('\x1B[1;36mType \'help\' or \'-h\' for available commands\x1B[0m');
    terminal.current.writeln('');
    terminal.current.write('\x1B[1;33m> \x1B[0m');

    // 處理輸入
    const handleData = (data: string) => {
      if (data === '\r') { // Enter
        terminal.current?.writeln('');
        handleCommand(inputBuffer.current);
        inputBuffer.current = '';
        terminal.current?.write('\x1B[1;33m> \x1B[0m');
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

  return (
    <div className="w-full h-full bg-black">
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  );
};

export default ArchimetersTerminal; 