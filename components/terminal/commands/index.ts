import { Terminal } from '@xterm/xterm';
import { BOX_STYLES, GEOMETRIC_BORDER } from '../styles/borders';
import { handleUpload } from './upload';
import { handlePreview } from './preview';
import { handleMock } from './mock';
import { createLayout, LAYOUT } from '../constants/layouts';
import { COLORS } from '../constants/colors';
import { COMMANDS } from '../constants/commands';
import { ERROR_MESSAGES } from '../constants/messages';

export const handleCommand = (terminal: Terminal | null, input: string) => {
  const [command, ...args] = input.trim().split(' ');
  
  switch (command) {
    case 'help':
    case '-h':
    case '?':
      showHelp(terminal);
      break;
    
    case 'upload':
      handleUpload(terminal, args);
      break;

    case 'preview':
      handlePreview(terminal);
      break;

    case 'clear':
      terminal?.clear();
      writeLine(terminal, '');
      drawLogo(terminal);
      writeLine(terminal, '');
      break;

    case 'mock':
      handleMock(terminal, args);
      break;

    default:
      if (command) {
        writeLine(terminal, ERROR_MESSAGES.UNKNOWN_COMMAND(command), COLORS.ERROR);
        writeLine(terminal, ERROR_MESSAGES.HELP_HINT, COLORS.DEFAULT);
      }
  }
};

const writeLine = (terminal: Terminal | null, text: string, color: string = COLORS.DEFAULT) => {
  terminal?.writeln(`\x1B[${color}m${text}\x1B[0m`);
};

const drawBox = (terminal: Terminal | null, title: string, content: string[], color: string = COLORS.DEFAULT) => {
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

const drawLogo = (terminal: Terminal | null) => {
  drawBox(terminal, '', [
    `                           ${COMMANDS.LOGO.TITLE}                             `,
    LAYOUT.LOGO_FRAME.TOP,
    `                    │        ${COMMANDS.LOGO.SUBTITLE}         │                    `,
    LAYOUT.LOGO_FRAME.BOTTOM
  ], COLORS.DEFAULT);
};

const showHelp = (terminal: Terminal | null) => {
  writeLine(terminal, GEOMETRIC_BORDER, COLORS.DEFAULT);
  
  const helpLayout = createLayout.helpMenu();
  
  drawBox(terminal, COMMANDS.HELP.TITLE, [
    helpLayout.basicCommands.title,
    helpLayout.basicCommands.commands[0].content,
    LAYOUT.EMPTY_LINE,
    helpLayout.designCommands.title,
    ...helpLayout.designCommands.commands.map(cmd => cmd.content)
  ], COLORS.DEFAULT);
  
  drawBox(terminal, COMMANDS.HELP.QUICK_REFERENCE, helpLayout.quickReference.shortcuts, COLORS.DEFAULT);
  
  writeLine(terminal, GEOMETRIC_BORDER, COLORS.DEFAULT);
}; 