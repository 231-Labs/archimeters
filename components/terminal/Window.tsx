import Terminal from './Terminal';
import Window from '../common/Window';
import type { WindowName } from '@/types';

interface TerminalWindowProps {
  onClose: () => void;
  name: WindowName;
}

const DEFAULT_SIZE = {
  width: 800,
  height: 600
};

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
    >
      <Terminal />
    </Window>
  );
};

export default TerminalWindow; 