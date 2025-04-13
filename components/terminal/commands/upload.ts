import { Terminal } from '@xterm/xterm';
import { GEOMETRIC_BORDER } from '../styles/borders';
import { writeLine, drawBox, showProgressBar } from '../utils';
import { UPLOAD_MESSAGES } from '../constants/messages';
import { COLORS } from '../constants/colors';
import { TIMINGS } from '../constants/timings';
import { createLayout } from '../constants/layouts';

/**
 * Handles the upload command
 * @param terminal - Terminal instance
 * @param args - Command arguments [configFile, algorithmFile]
 */
export const handleUpload = (terminal: Terminal | null, args: string[]) => {
  if (args.length < 2) {
    drawBox(terminal, UPLOAD_MESSAGES.ERROR.TITLE, [UPLOAD_MESSAGES.ERROR.USAGE], COLORS.ERROR);
    return;
  }

  const [configFile, algorithmFile] = args;
  writeLine(terminal, GEOMETRIC_BORDER, COLORS.INFO);
  
  // Use process info layout
  const processLayout = createLayout.processInfo(configFile, algorithmFile);
  drawBox(terminal, UPLOAD_MESSAGES.PROCESS.TITLE, [
    processLayout.header,
    processLayout.columns.header,
    processLayout.columns.content,
    processLayout.columns.footer
  ]);
  
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 0.1;
    if (progress <= 1) {
      showProgressBar(terminal, progress, UPLOAD_MESSAGES.PROCESS.ANALYZING);
    } else {
      clearInterval(progressInterval);
    }
  }, TIMINGS.UPLOAD.PROGRESS_INTERVAL);

  setTimeout(() => {
    clearInterval(progressInterval);
    terminal?.write('\r\x1B[K');

    // Use analysis result layout
    const analysisLayout = createLayout.analysisResult(
      UPLOAD_MESSAGES.COMPLETE.NAME,
      UPLOAD_MESSAGES.COMPLETE.TYPE,
      UPLOAD_MESSAGES.COMPLETE.DIMENSION,
      UPLOAD_MESSAGES.COMPLETE.ALGO
    );

    // Use generated files layout
    const blobId = Math.random().toString(16).slice(2, 10);
    const filesLayout = createLayout.generatedFiles(
      UPLOAD_MESSAGES.COMPLETE.VISUAL,
      UPLOAD_MESSAGES.COMPLETE.ALGORITHM,
      blobId,
      UPLOAD_MESSAGES.COMPLETE.STATUS
    );

    drawBox(terminal, UPLOAD_MESSAGES.COMPLETE.TITLE, [
      analysisLayout.header,
      analysisLayout.mainColumns[0].header,
      analysisLayout.mainColumns[0].content,
      analysisLayout.mainColumns[0].footer,
      analysisLayout.separator,
      analysisLayout.artifactsHeader,
      filesLayout.header.header,
      filesLayout.header.content,
      filesLayout.header.footer
    ], COLORS.SUCCESS);
    
    writeLine(terminal, '');
    drawBox(terminal, UPLOAD_MESSAGES.NEXT.TITLE, [
      UPLOAD_MESSAGES.NEXT.HINT
    ], COLORS.ACCENT);
    writeLine(terminal, GEOMETRIC_BORDER, COLORS.ACCENT);
  }, TIMINGS.UPLOAD.COMPLETION_DELAY);
}; 