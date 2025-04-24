export const WELCOME_MESSAGES = {
  TITLE: 'ARCHIMETERS DESIGN LAB',
  SUBTITLE: 'PARAMETRIC TERMINAL',
  WELCOME: 'Welcome to the Design Interface',
  TAGLINE: 'Bridging Reality & Digital Geometry',
  HELP_HINT: '💫 Type "help" or "-h" to explore commands',
  CURRENT_ACCOUNT: 'Current Account:',
  ACCOUNT_STATUS: {
    CONNECTED: 'Connected',
    NOT_CONNECTED: 'Not connected'
  },
  WALLET_SWITCH_HINT: '💡 To switch wallet, please use the Entry Window'
};

export const COMMAND_HELP = {
  BASIC_COMMANDS: {
    TITLE: 'Basic Commands',
    HELP: 'help, -h, ?  Show command list',
    CLEAR: 'clear         Reset interface'
  },
  DESIGN_COMMANDS: {
    TITLE: 'Design Commands',
    UPLOAD: 'upload <cfg> <alg>             ',
    UPLOAD_DESC: 'Upload parametric design       ',
    PREVIEW: 'preview        Virtual Gallery',
    MOCK: 'mock <success|fail>  Test process   '
  },
  QUICK_REFERENCE: {
    TITLE: 'Quick Reference',
    TAB: 'TAB           ',
    TAB_DESC: 'Autocomplete  ',
    CTRL_C: '^C            ',
    CTRL_C_DESC: 'Cancel        ',
    ARROWS: '↑↓            ',
    ARROWS_DESC: 'History       '
  }
};

export const ERROR_MESSAGES = {
  UNKNOWN_COMMAND: (command: string) => `⚠️  Unknown command: ${command}`,
  HELP_HINT: '💡 Type "help" or "-h" for available commands'
};

export const UPLOAD_MESSAGES = {
  ERROR: {
    TITLE: 'Upload Error',
    USAGE: 'Usage: upload <config-file>',
    INVALID_CONFIG: 'Invalid configuration file',
    FILE_NOT_FOUND: 'Configuration file not found',
    PARSE_ERROR: 'Failed to parse configuration file'
  },
  PROCESS: {
    TITLE: 'Upload Process',
    ANALYZING: 'Analyzing configuration file...',
    VALIDATING: 'Validating configuration...',
    PARSING: 'Parsing configuration...'
  },
  COMPLETE: {
    TITLE: 'Upload Complete',
    SUCCESS: 'Configuration file uploaded successfully',
    NEXT_STEPS: 'Next steps:',
    GENERATE_WEBSITE: '1. Generate website with "generate" command',
    VIEW_PREVIEW: '2. View preview with "preview" command'
  },
  NEXT: {
    TITLE: 'Next Steps',
    HINT: 'Use "generate" command to create the website'
  }
};

export const PREVIEW_MESSAGES = {
  GALLERY: {
    TITLE: 'VIRTUAL GALLERY',
    INIT: [
      '🌌 Initializing virtual space...',
      '🎨 Generating parametric visualization...',
      '🔮 Preparing dimensional gates...'
    ]
  },
  READY: {
    TITLE: 'GALLERY READY',
    INFO: [
      '  ┌─ Access Info ────────────────────────────',
      '  │ Status: ✨ Active',
      '  │ URL: virtual-space/geometric-patterns',
      '  │ Access: Public ⚡',
      '  └──────────────────────────────────────────'
    ]
  }
};

export const MOCK_MESSAGES = {
  SUCCESS: {
    PROCESS: '🧪 Simulating Design Upload Process',
    INIT: 'Initializing simulation',
    CONFIG: '┌ Configuration Analysis    [✓]',
    PARAM: '├ Parameter Validation      [✓]',
    BLOB: '├ Blob Generation          [✓]',
    DEPLOY: '└ Virtual Space Deployment  [✓]',
    COMPLETE: '🎉 Simulation completed successfully!'
  },
  FAIL: {
    PROCESS: '🧪 Simulating Design Upload Process',
    INIT: 'Initializing simulation',
    CONFIG: '┌ Configuration Analysis    [✓]',
    PARAM: '├ Parameter Validation      [✓]',
    BLOB: '├ Blob Generation          [✗]',
    ERROR: '└ Process terminated due to error',
    MESSAGE: '⚠️  Error: Invalid geometric transformation'
  },
  ERROR: '⚠️  Usage: mock <success|fail>'
}; 