export const retroButtonStyles = {
  button: {
    backgroundColor: '#000',
    color: '#fff',
    border: '2px solid #fff',
    padding: '8px 16px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  buttonHover: {
    backgroundColor: '#fff',
    color: '#000',
    border: '2px solid #000',
  },
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