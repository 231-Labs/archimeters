import Terminal from '../features/terminal/Terminal';
import { Window, WindowName } from '@/components/features/window-manager';
import { defaultWindowConfigs } from '@/config/windows';

/**
 * Props for the TerminalWindow component
 */
interface TerminalWindowProps {
  onClose: () => void;
  name: Extract<WindowName, 'terminal'>;
}

/**
 * Terminal window component that wraps the Terminal component in a window
 */
const TerminalWindow: React.FC<TerminalWindowProps> = ({ onClose, name }) => {
  if (!defaultWindowConfigs[name]) {
    throw new Error(`Window configuration not found for window type: ${name}`);
  }

  const config = defaultWindowConfigs[name];

  return (
    <Window
      name={name}
      title={config.title}
      position={{ x: 100, y: 100 }}
      size={config.defaultSize}
      isActive={true}
      resizable={config.resizable ?? true}
      onClose={onClose}
      onDragStart={() => {}}
      onClick={() => {}}
      zIndex={100}
      className="bg-black"
    >
      <Terminal />
    </Window>
  );
};

export default TerminalWindow; 