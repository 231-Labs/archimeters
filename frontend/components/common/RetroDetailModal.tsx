'use client';

import React from 'react';

interface RetroDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function RetroDetailModal({ isOpen, onClose, children }: RetroDetailModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="absolute inset-0 bg-background/55 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="absolute inset-0 bg-background text-foreground z-50 transform transition-transform duration-300 flex items-center justify-center p-4"
        style={{
          borderLeft: '2px solid var(--border)',
          boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.12)',
        }}
      >
        <div className="grid grid-cols-2 gap-4 max-w-6xl w-full" style={{ maxHeight: '90vh' }}>
          {children}
        </div>
      </div>
    </>
  );
}

interface DetailHeaderProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

export function DetailHeader({ title, subtitle, onClose }: DetailHeaderProps) {
  return (
    <div className="publisher-panel-out p-3 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-muted-foreground text-sm font-mono tracking-widest mb-1">{subtitle}</p>
        <h2 className="text-foreground/90 text-base font-mono tracking-wide truncate">{title}</h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="px-3 py-1 text-xs font-medium transition-colors publisher-panel-out bg-panel-deep text-foreground/90 hover:text-foreground shrink-0 ml-2"
      >
        BACK
      </button>
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string;
  isLast?: boolean;
}

export function InfoField({ label, value, isLast }: InfoFieldProps) {
  return (
    <div className={`flex justify-between items-center gap-2 py-1 ${!isLast ? 'border-b border-border' : ''}`}>
      <span className="text-muted-foreground text-xs font-mono tracking-wide shrink-0">{label}</span>
      <span className="text-foreground/85 font-mono text-xs text-right break-all">{value}</span>
    </div>
  );
}
