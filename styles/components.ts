// 復古風格的按鈕樣式
export const retroButtonStyles = {
  button: {
    backgroundColor: 'rgba(255, 252, 250, 0.7)',
    border: '1px solid rgba(0, 0, 0, 0.8)',
    boxShadow: '3px 3px 0 rgba(0,0,0,0.15)',
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#333',
    padding: '8px 16px',
    borderRadius: '0',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  buttonHover: {
    backgroundColor: 'rgba(255, 252, 250, 0.9)',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
    transform: 'translate(1px, 1px)',
  },
  // 連接後的樣式
  connectedButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 252, 250, 0.7)',
    border: '1px solid rgba(0, 0, 0, 0.8)',
    boxShadow: '3px 3px 0 rgba(0,0,0,0.15)',
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#333',
    padding: '8px 16px',
    borderRadius: '0',
    cursor: 'pointer',
  },
  // 下拉菜單樣式
  menu: {
    backgroundColor: 'rgba(255, 252, 250, 0.95)',
    border: '1px solid rgba(0, 0, 0, 0.8)',
    boxShadow: '3px 3px 0 rgba(0,0,0,0.15)',
    borderRadius: '0',
    padding: '4px',
  },
  menuItem: {
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#333',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'transparent',
    ':hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    }
  }
} as const; 