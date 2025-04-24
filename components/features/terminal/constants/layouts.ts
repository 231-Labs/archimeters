// 基礎布局常量
export const LAYOUT = {
  BOX_WIDTH: 78,
  CONTENT_PADDING: 28,
  DIVIDER: '  ╭────────────────────────────────╮  ╭────────────────────────────────╮   ',
  DIVIDER_END: '  ╰────────────────────────────────╯  ╰────────────────────────────────╯   ',
  EMPTY_LINE: '                                                                            ',
  LOGO_FRAME: {
    TOP: '                    ┌────────────────────────────────────┐                    ',
    BOTTOM: '                    └────────────────────────────────────┘                    '
  }
} as const;

// 布局生成器
export const createLayout = {
  // 居中文本
  centerText: (text: string, width: number = LAYOUT.BOX_WIDTH) => {
    const padding = Math.floor((width - text.length) / 2);
    return ' '.repeat(padding) + text + ' '.repeat(width - padding - text.length);
  },

  // Logo 布局
  logo: (title: string, subtitle: string) => ({
    title: createLayout.centerText(title),
    frame: {
      top: LAYOUT.LOGO_FRAME.TOP,
      content: createLayout.centerText(`│        ${subtitle}         │`),
      bottom: LAYOUT.LOGO_FRAME.BOTTOM
    }
  }),

  // 雙欄布局
  twoColumns: (left: string, right: string) => ({
    header: LAYOUT.DIVIDER,
    content: `  │ ${left.padEnd(32)}│  │ ${right.padEnd(32)}│   `,
    footer: LAYOUT.DIVIDER_END
  }),

  // 進度信息布局
  processInfo: (configFile: string, algorithmFile: string) => ({
    header: createLayout.centerText('Initializing Process'),
    columns: createLayout.twoColumns(
      `Config File: ${configFile.padEnd(16)}`,
      `Algorithm: ${algorithmFile.padEnd(16)}`
    )
  }),

  // 分析結果布局
  analysisResult: (name: string, type: string, dimension: string, algo: string) => ({
    header: createLayout.centerText('Series Information'),
    mainColumns: [
      createLayout.twoColumns(name, type),
      createLayout.twoColumns(dimension, algo)
    ],
    separator: LAYOUT.EMPTY_LINE,
    artifactsHeader: createLayout.centerText('Generated Artifacts')
  }),

  // 生成的文件布局
  generatedFiles: (visual: string, algorithm: string, blobId: string, status: string) => ({
    header: createLayout.twoColumns(visual, algorithm),
    content: createLayout.twoColumns(
      `✓ Blob ID: 0x${blobId}`,
      status
    )
  }),

  // 幫助菜單布局
  helpMenu: () => ({
    basicCommands: {
      title: createLayout.centerText('Basic Commands'),
      commands: [
        createLayout.twoColumns('help, -h, ?  Show command list', 'clear         Reset interface')
      ]
    },
    designCommands: {
      title: createLayout.centerText('Design Commands'),
      commands: [
        createLayout.twoColumns(
          'upload <cfg> <alg>',
          'preview        Virtual Gallery'
        ),
        createLayout.twoColumns(
          'Upload parametric design',
          'mock <ok|fail>  Test process'
        )
      ]
    },
    quickReference: {
      title: createLayout.centerText('Quick Reference'),
      shortcuts: [
        '  ╭─────────────────╮  ╭─────────────────╮  ╭─────────────────╮           ',
        '  │   TAB           │  |   ^C            │  |   ↑↓            │           ',
        '  │   Autocomplete  │  │   Cancel        │  │   History       │           ',
        '  ╰─────────────────╯  ╰─────────────────╯  ╰─────────────────╯           '
      ]
    }
  })
} as const; 