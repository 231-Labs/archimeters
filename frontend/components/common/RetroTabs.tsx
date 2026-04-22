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
        className={`retro-tabs-list flex gap-1 justify-center ${className}`}
      >
        {children}
      </Tabs.List>
    );
  }
);

RetroTabsList.displayName = 'RetroTabsList';

/**
 * RetroTabsTrigger - Individual retro OS styled tab
 */
export const RetroTabsTrigger = React.forwardRef<HTMLButtonElement, RetroTabsTriggerProps>(
  ({ value, children, className = '' }, ref) => {
    return (
      <Tabs.Trigger
        ref={ref}
        value={value}
        className={`relative px-4 py-1.5 text-xs font-medium transition-all outline-none rounded-md ${className}`}
        data-radix-tabs-trigger
      >
        {children}
      </Tabs.Trigger>
    );
  }
);

RetroTabsTrigger.displayName = 'RetroTabsTrigger';
