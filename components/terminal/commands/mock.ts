import { Terminal } from '@xterm/xterm';
import { GEOMETRIC_BORDER } from '../styles/borders';
import { writeLine, startLoading, stopLoading } from '../utils';
import { MOCK_MESSAGES } from '../constants/messages';
import { COLORS } from '../constants/colors';
import { TIMINGS } from '../constants/timings';

export const handleMock = (terminal: Terminal | null, args: string[]) => {
  if (args[0] === 'success') {
    writeLine(terminal, GEOMETRIC_BORDER, COLORS.DEFAULT);
    writeLine(terminal, MOCK_MESSAGES.SUCCESS.PROCESS, COLORS.WARNING);
    startLoading(terminal, MOCK_MESSAGES.SUCCESS.INIT);
    
    setTimeout(() => {
      stopLoading(terminal);
      writeLine(terminal, MOCK_MESSAGES.SUCCESS.CONFIG, COLORS.DEFAULT);
      startLoading(terminal, 'Processing files');
    }, TIMINGS.MOCK.CONFIG_DELAY);
    
    setTimeout(() => {
      stopLoading(terminal);
      writeLine(terminal, MOCK_MESSAGES.SUCCESS.PARAM, COLORS.DEFAULT);
      startLoading(terminal, 'Generating blob');
    }, TIMINGS.MOCK.PARAM_DELAY);
    
    setTimeout(() => {
      stopLoading(terminal);
      writeLine(terminal, MOCK_MESSAGES.SUCCESS.BLOB, COLORS.DEFAULT);
      writeLine(terminal, MOCK_MESSAGES.SUCCESS.DEPLOY, COLORS.DEFAULT);
      writeLine(terminal, '\n' + MOCK_MESSAGES.SUCCESS.COMPLETE, COLORS.SUCCESS);
      writeLine(terminal, GEOMETRIC_BORDER, COLORS.DEFAULT);
    }, TIMINGS.MOCK.COMPLETE_DELAY);
  } else if (args[0] === 'fail') {
    writeLine(terminal, GEOMETRIC_BORDER, COLORS.DEFAULT);
    writeLine(terminal, MOCK_MESSAGES.FAIL.PROCESS, COLORS.WARNING);
    startLoading(terminal, MOCK_MESSAGES.FAIL.INIT);
    
    setTimeout(() => {
      stopLoading(terminal);
      writeLine(terminal, MOCK_MESSAGES.FAIL.CONFIG, COLORS.DEFAULT);
      startLoading(terminal, 'Processing files');
    }, TIMINGS.MOCK.CONFIG_DELAY);
    
    setTimeout(() => {
      stopLoading(terminal);
      writeLine(terminal, MOCK_MESSAGES.FAIL.PARAM, COLORS.DEFAULT);
      writeLine(terminal, MOCK_MESSAGES.FAIL.BLOB, COLORS.DEFAULT);
      writeLine(terminal, MOCK_MESSAGES.FAIL.ERROR, COLORS.ERROR);
      writeLine(terminal, '\n' + MOCK_MESSAGES.FAIL.MESSAGE, COLORS.ERROR);
      writeLine(terminal, GEOMETRIC_BORDER, COLORS.DEFAULT);
    }, TIMINGS.MOCK.PARAM_DELAY);
  } else {
    writeLine(terminal, MOCK_MESSAGES.ERROR, COLORS.ERROR);
  }
}; 