import { Terminal } from '@xterm/xterm';
import { BOX_STYLES } from './styles/borders';
import { LOADING_FRAMES } from './styles/animations';
import { WELCOME_MESSAGES } from './constants/messages';
import { createLayout } from './constants/layouts';
import { COLORS } from './constants/colors';

export const writeLine = (terminal: Terminal | null, text: string, color: string = COLORS.DEFAULT) => {
  terminal?.writeln(`\x1B[${color}m${text}\x1B[0m`);
};

export const drawBox = (terminal: Terminal | null, title: string, content: string[], color: string = COLORS.DEFAULT) => {
  const width = 78;
  const paddedTitle = ` ${title} `;
  const leftPadding = Math.floor((width - paddedTitle.length) / 2);
  
  writeLine(terminal, `${BOX_STYLES.topLeft}${BOX_STYLES.horizontal.repeat(leftPadding)}${paddedTitle}${BOX_STYLES.horizontal.repeat(width - leftPadding - paddedTitle.length)}${BOX_STYLES.topRight}`, color);
  content.forEach(line => {
    const paddedLine = line.padEnd(width, ' ');
    writeLine(terminal, `${BOX_STYLES.vertical}${paddedLine}${BOX_STYLES.vertical}`, color);
  });
  writeLine(terminal, `${BOX_STYLES.bottomLeft}${BOX_STYLES.horizontal.repeat(width)}${BOX_STYLES.bottomRight}`, color);
};

export const showProgressBar = (terminal: Terminal | null, progress: number, message: string) => {
  const width = 20;
  const filled = Math.floor(progress * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  terminal?.write(`\r\x1B[K[${bar}] ${(progress * 100).toFixed(0)}% ${message}`);
};

export const drawLogo = (terminal: Terminal | null) => {
  const logo = createLayout.logo(WELCOME_MESSAGES.TITLE, WELCOME_MESSAGES.SUBTITLE);
  drawBox(terminal, '', [
    logo.title,
    logo.frame.top,
    logo.frame.content,
    logo.frame.bottom
  ], COLORS.DEFAULT);
};

let loadingInterval: NodeJS.Timeout | null = null;

export const startLoading = (terminal: Terminal | null, message: string) => {
  let frame = 0;
  loadingInterval = setInterval(() => {
    terminal?.write('\r\x1B[K');
    terminal?.write(`\x1B[${COLORS.WARNING}m${LOADING_FRAMES[frame]} ${message}\x1B[0m`);
    frame = (frame + 1) % LOADING_FRAMES.length;
  }, 100);
};

export const stopLoading = (terminal: Terminal | null) => {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    terminal?.write('\r\x1B[K');
  }
}; 