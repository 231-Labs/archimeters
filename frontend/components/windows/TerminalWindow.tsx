import dynamic from 'next/dynamic';
import { Window, WindowName } from '@/components/features/window-manager';
import { defaultWindowConfigs } from '@/config/windows';

// Dynamic import to avoid SSR issues and chunk loading errors
const Terminal = dynamic(() => import('../features/terminal/Terminal'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-black text-white font-mono">
      <div className="text-center">
        <div className="animate-pulse text-green-400 mb-2">⚡ Loading...</div>
        <div className="text-sm text-gray-400">Initializing terminal</div>
      </div>
    </div>
  ),
});

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