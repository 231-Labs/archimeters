import { useEffect, useRef, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
// import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

const TERMINAL_THEME = {
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

const terminalStyles = {
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

const BOX_STYLES = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
  verticalRight: '├',
  verticalLeft: '┤',
  horizontalDown: '┬',
  horizontalUp: '┴',
  cross: '┼'
};

const GEOMETRIC_BORDER = '─'.repeat(80);
const SECTION_BORDER = '·'.repeat(80);

const LOADING_FRAMES = ['◢', '◣', '◤', '◥'];
const PROGRESS_BAR_FRAMES = ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];

interface DesignSeries {
  name: string;
  description: string;
  mainImage: string;
}

const ArchimetersTerminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm>();
  const terminal = useRef<XTerm | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const inputBuffer = useRef<string>('');
  const configBuffer = useRef<Partial<DesignSeries>>({});
  const currentStep = useRef<number>(0);
  const loadingInterval = useRef<NodeJS.Timeout | null>(null);

  const showPrompt = () => {
    terminal.current?.write('\x1B[1;37m∆ \x1B[0m');
  };

  const writeLine = (text: string, color: string = '1;37') => {
    terminal.current?.writeln(`\x1B[${color}m${text}\x1B[0m`);
  };

  const writeGeometricBorder = () => {
    writeLine(GEOMETRIC_BORDER, '1;37');
  };

  const startLoading = (message: string) => {
    let frame = 0;
    loadingInterval.current = setInterval(() => {
      terminal.current?.write('\r\x1B[K'); // 清除當前行
      terminal.current?.write(`\x1B[1;33m${LOADING_FRAMES[frame]} ${message}\x1B[0m`);
      frame = (frame + 1) % LOADING_FRAMES.length;
    }, 100);
  };

  const stopLoading = () => {
    if (loadingInterval.current) {
      clearInterval(loadingInterval.current);
      terminal.current?.write('\r\x1B[K'); // 清除載入動畫
    }
  };

  const drawBox = (title: string, content: string[], color: string = '1;37') => {
    const width = 78;
    const paddedTitle = ` ${title} `;
    const leftPadding = Math.floor((width - paddedTitle.length) / 2);
    
    writeLine(`${BOX_STYLES.topLeft}${BOX_STYLES.horizontal.repeat(leftPadding)}${paddedTitle}${BOX_STYLES.horizontal.repeat(width - leftPadding - paddedTitle.length)}${BOX_STYLES.topRight}`, '1;37');
    content.forEach(line => {
      const paddedLine = line.padEnd(width, ' ');
      writeLine(`${BOX_STYLES.vertical}${paddedLine}${BOX_STYLES.vertical}`, color);
    });
    writeLine(`${BOX_STYLES.bottomLeft}${BOX_STYLES.horizontal.repeat(width)}${BOX_STYLES.bottomRight}`, '1;37');
  };

  const showProgressBar = (progress: number, message: string) => {
    const width = 20;
    const filled = Math.floor(progress * width);
    const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
    terminal.current?.write(`\r\x1B[K[${bar}] ${(progress * 100).toFixed(0)}% ${message}`);
  };

  const handleUpload = (args: string[]) => {
    if (args.length < 2) {
      drawBox('ERROR', ['⚠️  Usage: upload <config> <algo>'], '1;31');
      return;
    }

    const [configFile, algorithmFile] = args;
    writeLine(GEOMETRIC_BORDER, '1;34');
    drawBox('PARAMETRIC UPLOAD', [
      '                            Initializing Process                              ',
      '  ╭────────────────────────────────╮  ╭────────────────────────────────╮   ',
      `  │ Config File: ${configFile.padEnd(16)}  │  │ Algorithm: ${algorithmFile.padEnd(16)}    │`,
      '  ╰────────────────────────────────╯  ╰────────────────────────────────╯   '
    ]);
    
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 0.1;
      if (progress <= 1) {
        showProgressBar(progress, 'Analyzing geometric parameters...');
      } else {
        clearInterval(progressInterval);
      }
    }, 200);

    setTimeout(() => {
      clearInterval(progressInterval);
      terminal.current?.write('\r\x1B[K');
      drawBox('ANALYSIS COMPLETE', [
        '                            Series Information                              ',
        '  ╭────────────────────────────────╮  ╭────────────────────────────────╮   ',
        '  │ Name: Geometric Patterns Vol.1 │  │ Type: Parametric Design        │   ',
        '  │ Dimension: Multi-dimensional   │  │ Algo: Euclidean Transform      │   ',
        '  ╰────────────────────────────────╯  ╰────────────────────────────────╯   ',
        '                                                                            ',
        '                           Generated Artifacts                              ',
        '  ╭────────────────────────────────╮  ╭────────────────────────────────╮   ',
        '  │ ✓ Main Visual: main.png        │  │ ✓ Algorithm: processed.js      │   ',
        `  │ ✓ Blob ID: 0x${Math.random().toString(16).slice(2, 10)}          │  | ✓ Status: Ready for Preview    │   `,
        '  ╰────────────────────────────────╯  ╰────────────────────────────────╯   '
      ], '1;32');
      
      writeLine('');
      drawBox('NEXT STEP', [
        '💫 Type "preview" to enter the virtual gallery and explore your design'
      ], '1;36');
      writeLine(GEOMETRIC_BORDER, '1;36');
    }, 3000);
  };

  const handlePreview = () => {
    writeLine(GEOMETRIC_BORDER, '1;34');
    drawBox('VIRTUAL GALLERY', [
      '🌌 Initializing virtual space...',
      '🎨 Generating parametric visualization...',
      '🔮 Preparing dimensional gates...'
    ]);
    
    setTimeout(() => {
      drawBox('GALLERY READY', [
        '  ┌─ Access Info ────────────────────────────',
        '  │ Status: ✨ Active',
        '  │ URL: virtual-space/geometric-patterns',
        '  │ Access: Public ⚡',
        '  └──────────────────────────────────────────'
      ], '1;32');
      writeLine(GEOMETRIC_BORDER, '1;34');
    }, 2000);
  };

  const showHelp = () => {
    writeLine(GEOMETRIC_BORDER, '1;90');
    drawBox('COMMAND INTERFACE', [
      '                              Basic Commands                                 ',
      '  ╭────────────────────────────────╮  ╭────────────────────────────────╮   ',
      '  │ help, -h, ?  Show command list │  │ clear         Reset interface  │   ',
      '  ╰────────────────────────────────╯  ╰────────────────────────────────╯   ',
      '                                                                            ',
      '                             Design Commands                                ',
      '  ╭────────────────────────────────╮  ╭────────────────────────────────╮   ',
      '  │ upload <cfg> <alg>             │  │ preview        Virtual Gallery │   ',
      '  │ Upload parametric design       │  │ mock <ok|fail>  Test process   │   ',
      '  ╰────────────────────────────────╯  ╰────────────────────────────────╯   '
    ], '1;37');
    
    drawBox('QUICK REFERENCE', [
      '  ╭─────────────────╮  ╭─────────────────╮  ╭─────────────────╮           ',
      '  │   TAB           │  |   ^C            │  |   ↑↓            │           ',
      '  │   Autocomplete  │  │   Cancel        │  │   History       │           ',
      '  ╰─────────────────╯  ╰─────────────────╯  ╰─────────────────╯           '
    ], '1;37');
    writeLine(GEOMETRIC_BORDER, '1;90');
  };

  const drawLogo = () => {
    drawBox('', [
      '                           ARCHIMETERS DESIGN LAB                             ',
      '                    ┌────────────────────────────────────┐                    ',
      '                    │        PARAMETRIC TERMINAL         │                    ',
      '                    └────────────────────────────────────┘                    '
    ], '1;37');
  };

  const handleCommand = useCallback((input: string) => {
    const [command, ...args] = input.trim().split(' ');
    
    switch (command) {
      case 'help':
      case '-h':
      case '?':
        showHelp();
        break;
      
      case 'upload':
        handleUpload(args);
        break;

      case 'preview':
        handlePreview();
        break;

      case 'clear':
        terminal.current?.clear();
        writeLine('');
        drawLogo();
        writeLine('');
        break;

      case 'mock':
        if (args[0] === 'success') {
          writeGeometricBorder();
          writeLine('🧪 Simulating Design Upload Process', '1;33');
          startLoading('Initializing simulation');
          
          setTimeout(() => {
            stopLoading();
            writeLine('┌ Configuration Analysis    [\x1B[1;32m✓\x1B[0m]', '1;37');
            startLoading('Processing files');
          }, 1000);
          
          setTimeout(() => {
            stopLoading();
            writeLine('├ Parameter Validation      [\x1B[1;32m✓\x1B[0m]', '1;37');
            startLoading('Generating blob');
          }, 2000);
          
          setTimeout(() => {
            stopLoading();
            writeLine('├ Blob Generation          [\x1B[1;32m✓\x1B[0m]', '1;37');
            writeLine('└ Virtual Space Deployment  [\x1B[1;32m✓\x1B[0m]', '1;37');
            writeLine('\n🎉 Simulation completed successfully!', '1;32');
            writeGeometricBorder();
          }, 3000);
        } else if (args[0] === 'fail') {
          writeGeometricBorder();
          writeLine('🧪 Simulating Design Upload Process', '1;33');
          startLoading('Initializing simulation');
          
          setTimeout(() => {
            stopLoading();
            writeLine('┌ Configuration Analysis    [\x1B[1;32m✓\x1B[0m]', '1;37');
            startLoading('Processing files');
          }, 1000);
          
          setTimeout(() => {
            stopLoading();
            writeLine('├ Parameter Validation      [\x1B[1;32m✓\x1B[0m]', '1;37');
            writeLine('├ Blob Generation          [\x1B[1;31m✗\x1B[0m]', '1;37');
            writeLine('└ Process terminated due to error', '1;31');
            writeLine('\n⚠️  Error: Invalid geometric transformation', '1;31');
            writeGeometricBorder();
          }, 2000);
        } else {
          writeLine('⚠️  Usage: mock <success|fail>', '1;31');
        }
        break;

      default:
        if (command) {
          writeLine(`⚠️  Unknown command: ${command}`, '1;31');
          writeLine('💡 Type "help" or "-h" for available commands', '1;37');
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
    writeLine('');
    drawLogo();
    writeLine('');
    writeLine('                         Welcome to the Design Interface                          ', '1;37');
    writeLine('                     Bridging Reality & Digital Geometry                      ', '1;37');
    writeLine(GEOMETRIC_BORDER, '1;34');
    writeLine('');
    writeLine('💫 Type "help" or "-h" to explore commands', '1;37');
    writeLine('');
    showPrompt();

    // 處理輸入
    const handleData = (data: string) => {
      if (data === '\r') { // Enter
        terminal.current?.writeln('');
        handleCommand(inputBuffer.current);
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
      if (loadingInterval.current) {
        clearInterval(loadingInterval.current);
      }
      window.removeEventListener('resize', handleResize);
      terminal.current?.dispose();
      styleSheet.remove();
    };
  }, []);

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