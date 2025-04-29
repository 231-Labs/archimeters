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
  })
} as const; 