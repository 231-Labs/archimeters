import Terminal from './Terminal';
import Window from '../common/Window';
import type { TerminalWindowProps } from './types';

const TerminalWindow: React.FC<TerminalWindowProps> = ({
  name,
  position,
  size,
  isActive,
  onClose,
  onDragStart,
  onResize,
  onClick,
}) => {
  return (
    <Window
      name={name}
      title="Archimeters Terminal"
      position={position}
      size={size}
      isActive={isActive}
      resizable={true}
      onClose={onClose}
      onDragStart={onDragStart}
      onResize={onResize}
      onClick={onClick}
    >
      <Terminal />
    </Window>
  );
};

export default TerminalWindow; 