import { Terminal } from '@xterm/xterm';
import { GEOMETRIC_BORDER } from '../styles/borders';
import { writeLine, drawBox } from '../utils';
import { PREVIEW_MESSAGES } from '../constants/messages';
import { COLORS } from '../constants/colors';
import { TIMINGS } from '../constants/timings';

/**
 * Handles the preview command to display gallery and ready status
 * @param terminal - Terminal instance
 */
export const handlePreview = (terminal: Terminal | null) => {
  writeLine(terminal, GEOMETRIC_BORDER, COLORS.INFO);
  drawBox(terminal, PREVIEW_MESSAGES.GALLERY.TITLE, PREVIEW_MESSAGES.GALLERY.INIT);
  
  setTimeout(() => {
    drawBox(terminal, PREVIEW_MESSAGES.READY.TITLE, PREVIEW_MESSAGES.READY.INFO, COLORS.SUCCESS);
    writeLine(terminal, GEOMETRIC_BORDER, COLORS.INFO);
  }, TIMINGS.PREVIEW.READY_DELAY);
}; 