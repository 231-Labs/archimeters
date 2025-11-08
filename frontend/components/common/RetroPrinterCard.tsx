'use client';

import React from 'react';

interface Printer {
  id: string;
  alias?: string;
  online: boolean;
}

interface RetroPrinterCardProps {
  printer: Printer;
  onSelect: () => void;
}

/**
 * RetroPrinterCard - Retro OS styled printer selection card
 */
export function RetroPrinterCard({ printer, onSelect }: RetroPrinterCardProps) {
  const isDisabled = !printer.online;

  return (
    <div
      onClick={isDisabled ? undefined : onSelect}
      className={`p-3 font-mono transition-all ${
        isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{
        backgroundColor: '#1a1a1a',
        borderTop: '2px solid #2a2a2a',
        borderLeft: '2px solid #2a2a2a',
        borderBottom: '2px solid #0a0a0a',
        borderRight: '2px solid #0a0a0a',
        boxShadow: 'inset -1px -1px 2px rgba(255, 255, 255, 0.05), inset 1px 1px 2px rgba(0, 0, 0, 0.5)',
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = '#252525';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = '#1a1a1a';
        }
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(1px)';
          e.currentTarget.style.borderTop = '2px solid #0a0a0a';
          e.currentTarget.style.borderLeft = '2px solid #0a0a0a';
          e.currentTarget.style.borderBottom = '2px solid #2a2a2a';
          e.currentTarget.style.borderRight = '2px solid #2a2a2a';
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderTop = '2px solid #2a2a2a';
          e.currentTarget.style.borderLeft = '2px solid #2a2a2a';
          e.currentTarget.style.borderBottom = '2px solid #0a0a0a';
          e.currentTarget.style.borderRight = '2px solid #0a0a0a';
        }
      }}
    >
      {/* Header with status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Status indicator - square pixel style */}
          <div 
            className={`w-2 h-2 ${printer.online ? 'bg-green-500' : 'bg-[#555]'}`}
            style={{
              boxShadow: printer.online 
                ? '0 0 4px rgba(34, 197, 94, 0.6)' 
                : 'inset 1px 1px 1px rgba(0, 0, 0, 0.8)',
            }}
          />
          <span className="text-sm font-medium text-white/90 truncate uppercase tracking-wider">
            {printer.alias || 'UNKNOWN PRINTER'}
          </span>
        </div>
        
        {/* Status badge */}
        <div 
          className={`text-[10px] px-2 py-0.5 uppercase tracking-widest ${
            printer.online ? 'text-green-400' : 'text-white/40'
          }`}
          style={{
            backgroundColor: printer.online ? '#0a0a0a' : '#0f0f0f',
            borderTop: '1px solid #0a0a0a',
            borderLeft: '1px solid #0a0a0a',
            borderBottom: printer.online ? '1px solid #2a2a2a' : '1px solid #1a1a1a',
            borderRight: printer.online ? '1px solid #2a2a2a' : '1px solid #1a1a1a',
            boxShadow: 'inset 1px 1px 1px rgba(0, 0, 0, 0.6)',
          }}
        >
          {printer.online ? 'ONLINE' : 'OFFLINE'}
        </div>
      </div>
      
      {/* Printer ID */}
      <div className="text-[10px] text-white/40 truncate tracking-wider">
        ID: {printer.id.substring(0, 6)}...{printer.id.slice(-6)}
      </div>
    </div>
  );
}

