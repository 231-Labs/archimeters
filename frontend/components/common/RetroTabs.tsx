import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';

interface RetroTabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface RetroTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * RetroTabsList - Retro OS styled tab bar container
 */
export const RetroTabsList = React.forwardRef<HTMLDivElement, RetroTabsListProps>(
  ({ children, className = '' }, ref) => {
    return (
      <Tabs.List
        ref={ref}
        className={`
          flex gap-1 p-1 
          bg-[#0f0f0f]
          justify-center
          ${className}
        `}
        style={{
          borderBottom: '2px solid #0a0a0a',
          boxShadow: 'inset 0 -1px 2px rgba(0, 0, 0, 0.5)',
        }}
      >
        {children}
      </Tabs.List>
    );
  }
);

RetroTabsList.displayName = 'RetroTabsList';

/**
 * RetroTabsTrigger - Individual retro OS styled tab
 * Features beveled 3D effect similar to RetroButton but with tab-specific styling
 */
export const RetroTabsTrigger = React.forwardRef<HTMLButtonElement, RetroTabsTriggerProps>(
  ({ value, children, className = '' }, ref) => {
    return (
      <Tabs.Trigger
        ref={ref}
        value={value}
        className={`
          relative px-4 py-1.5 text-xs font-medium
          transition-all duration-75
          outline-none
          ${className}
        `}
        style={{
          color: '#cccccc',
        }}
        onMouseDown={(e) => {
          const isActive = e.currentTarget.getAttribute('data-state') === 'active';
          if (!isActive) {
            // Non-active tab press effect
            e.currentTarget.style.transform = 'translateY(1px)';
          }
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        // Use data attribute styling instead of inline for better performance
        data-radix-tabs-trigger
      >
        {children}
      </Tabs.Trigger>
    );
  }
);

RetroTabsTrigger.displayName = 'RetroTabsTrigger';

// Add global styles for active/inactive states
if (typeof document !== 'undefined') {
  const styleId = 'retro-tabs-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      [data-radix-tabs-trigger] {
        background-color: #1a1a1a;
        color: #cccccc;
        border-top: 2px solid #2a2a2a;
        border-left: 2px solid #2a2a2a;
        border-bottom: 2px solid #0a0a0a;
        border-right: 2px solid #0a0a0a;
        box-shadow: 
          inset 1px 1px 2px rgba(255, 255, 255, 0.05),
          inset -1px -1px 2px rgba(0, 0, 0, 0.5);
      }

      [data-radix-tabs-trigger]:hover {
        background-color: #222222;
        color: #ffffff;
      }

      [data-radix-tabs-trigger][data-state="active"] {
        background-color: #1a1a1a;
        color: #ffffff;
        border-top: 2px solid #0a0a0a;
        border-left: 2px solid #0a0a0a;
        border-bottom: 2px solid #333333;
        border-right: 2px solid #333333;
        box-shadow: 
          inset 1px 1px 3px rgba(0, 0, 0, 0.7),
          inset -1px -1px 1px rgba(255, 255, 255, 0.03);
        transform: translateY(1px);
      }

      [data-radix-tabs-trigger][data-state="inactive"] {
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }
}

