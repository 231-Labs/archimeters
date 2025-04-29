import { Terminal } from '@xterm/xterm';
import { BOX_STYLES } from './styles/borders';
import { WELCOME_MESSAGES } from './constants/messages';
import { createLayout } from './constants/layouts';
import { COLORS } from './constants/colors';

/**
 * Writes a line of text to the terminal with specified color
 */
export const writeLine = (terminal: Terminal | null, text: string, color: string = COLORS.DEFAULT) => {
  terminal?.writeln(`\x1B[${color}m${text}\x1B[0m`);
};

/**
 * Draws a box with title and content in the terminal
 */
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

/**
 * Draws the application logo in the terminal
 */
export const drawLogo = (terminal: Terminal | null) => {
  const logo = createLayout.logo(WELCOME_MESSAGES.TITLE, WELCOME_MESSAGES.SUBTITLE);
  drawBox(terminal, '', [
    logo.title,
    logo.frame.top,
    logo.frame.content,
    logo.frame.bottom
  ], COLORS.DEFAULT);
}; 