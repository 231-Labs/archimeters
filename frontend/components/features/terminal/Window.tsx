import Terminal from './Terminal';
import Window from '@/components/common/Window';
import type { WindowName } from '@/types';

/**
 * Props for the TerminalWindow component
 */
interface TerminalWindowProps {
  onClose: () => void;
  name: WindowName;
}

/**
 * Default size for the terminal window
 */
const DEFAULT_SIZE = {
  width: 800,
  height: 600
};

/**
 * Terminal window component that wraps the Terminal component in a window
 */
const TerminalWindow: React.FC<TerminalWindowProps> = ({ onClose, name }) => {
  return (
    <Window
      name={name}
      title="Archimeters Terminal"
      position={{ x: 100, y: 100 }}
      size={DEFAULT_SIZE}
      isActive={true}
      resizable={true}
      onClose={onClose}
      onDragStart={() => {}}
      onClick={() => {}}
      zIndex={100}
    >
      <Terminal />
    </Window>
  );
};

export default TerminalWindow; 