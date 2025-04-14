import { Terminal } from '@xterm/xterm';
import { GEOMETRIC_BORDER } from '../styles/borders';
import { writeLine, drawBox, showProgressBar } from '../utils';
import { UPLOAD_MESSAGES } from '../constants/messages';
import { COLORS } from '../constants/colors';
import { TIMINGS } from '../constants/timings';
import { createLayout } from '../constants/layouts';

interface ProjectConfig {
  project: {
    name: string;
    description: string;
    designFee: number;
    timeline: {
      startDate: string;
      endDate: string;
    };
    design: {
      modelFile: string;
      previewImage: string;
      overrides?: {
        parameters?: {
          width?: number | null;
          height?: number | null;
          depth?: number | null;
        };
        camera?: {
          position?: [number, number, number] | null;
          target?: [number, number, number] | null;
        };
        materials?: {
          color?: string | null;
        };
      };
    };
    output: {
      website: {
        title: string;
        description: string;
        theme: 'light' | 'dark';
        features: {
          modelViewer: boolean;
          parameterControls: boolean;
          materialPreview: boolean;
        };
      };
    };
  };
}

const validateConfig = (config: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Basic validation
  if (!config.project) {
    errors.push('Missing project configuration');
    return { isValid: false, errors };
  }

  const { project } = config;

  // Required fields validation
  if (!project.name) errors.push('Project name is required');
  if (!project.description) errors.push('Project description is required');
  if (typeof project.designFee !== 'number' || project.designFee <= 0) {
    errors.push('Design fee must be a positive number');
  }

  // Timeline validation
  if (!project.timeline?.startDate || !project.timeline?.endDate) {
    errors.push('Start date and end date are required');
  }

  // Design validation
  if (!project.design?.modelFile) errors.push('3D model file path is required');
  if (!project.design?.previewImage) errors.push('Preview image path is required');

  // Output validation
  if (!project.output?.website?.title) errors.push('Website title is required');
  if (!project.output?.website?.description) errors.push('Website description is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Handles the upload command
 * @param terminal - Terminal instance
 * @param args - Command arguments
 */
export const handleUpload = async (terminal: Terminal | null, args: string[]) => {
  const validCommands = ['', 'config', 'conf'];
  if (!validCommands.includes(args[0] || '')) {
    drawBox(terminal, UPLOAD_MESSAGES.ERROR.TITLE, [UPLOAD_MESSAGES.ERROR.USAGE], COLORS.ERROR);
    return;
  }

  writeLine(terminal, GEOMETRIC_BORDER, COLORS.INFO);
  
  // Create file input and trigger it
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  let progressInterval: NodeJS.Timeout | null = null;

  const startProgress = () => {
    let progress = 0;
    progressInterval = setInterval(() => {
      progress += 0.15;
      if (progress <= 1) {
        showProgressBar(terminal, progress, UPLOAD_MESSAGES.PROCESS.ANALYZING);
      } else {
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      }
    }, 100);
  };

  const clearProgress = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    terminal?.write('\r\x1B[K');
  };

  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) {
      drawBox(terminal, UPLOAD_MESSAGES.ERROR.TITLE, ['No file selected'], COLORS.ERROR);
      return;
    }

    // Start progress animation after file is selected
    startProgress();

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const config = JSON.parse(event.target?.result as string) as ProjectConfig;
          
          // Validate config
          const { isValid, errors } = validateConfig(config);
          if (!isValid) {
            clearProgress();
            drawBox(terminal, 'Configuration Error', errors, COLORS.ERROR);
            return;
          }

          // Display parsed configuration
          setTimeout(() => {
            clearProgress();

            const analysisLayout = createLayout.analysisResult(
              config.project.name,
              config.project.description,
              `Design Fee: ${config.project.designFee} ETH`,
              `Timeline: ${config.project.timeline.startDate} to ${config.project.timeline.endDate}`
            );

            const filesLayout = createLayout.generatedFiles(
              `Model: ${config.project.design.modelFile}`,
              `Preview: ${config.project.design.previewImage}`,
              'Website',
              'Configuration Valid'
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

        } catch (error) {
          clearProgress();
          drawBox(terminal, 'Error', [
            'Failed to parse configuration file',
            error instanceof Error ? error.message : 'Unknown error'
          ], COLORS.ERROR);
        }
      };

      reader.onerror = () => {
        clearProgress();
        drawBox(terminal, UPLOAD_MESSAGES.ERROR.TITLE, ['Failed to read file'], COLORS.ERROR);
      };

      reader.onabort = () => {
        clearProgress();
        drawBox(terminal, UPLOAD_MESSAGES.ERROR.TITLE, ['File reading was aborted'], COLORS.ERROR);
      };

      reader.readAsText(file);
    } catch (error) {
      clearProgress();
      drawBox(terminal, 'Error', [
        'Failed to handle file upload',
        error instanceof Error ? error.message : 'Unknown error'
      ], COLORS.ERROR);
    }
  };

  input.click();
}; 