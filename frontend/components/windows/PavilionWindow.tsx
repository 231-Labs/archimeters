'use client';

import { useState, useRef } from 'react';
import { PAVILION_KIOSKS, getPavilionUrl, getCategoryColor, PavilionConfig } from '@/config/pavilion';
import type { WindowName } from '@/types';

interface PavilionWindowProps {
  name: WindowName;
}

export default function PavilionWindow({}: PavilionWindowProps) {
  const [selectedPavilion, setSelectedPavilion] = useState<PavilionConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [previousPavilion, setPreviousPavilion] = useState<PavilionConfig | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePavilionSelect = (pavilion: PavilionConfig) => {
    if (selectedPavilion) {
      setPreviousPavilion(selectedPavilion);
    }
    setIsLoading(true);
    setSelectedPavilion(pavilion);
    // Set a timeout to hide loading state
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleGoBack = () => {
    if (previousPavilion) {
      setSelectedPavilion(previousPavilion);
      setPreviousPavilion(null);
    } else {
      setSelectedPavilion(null);
    }
  };

  const handleCopyUrl = () => {
    if (selectedPavilion) {
      const url = `pavilion-231.vercel.app/pavilion/visit?kioskId=${selectedPavilion.kioskId}`;
      navigator.clipboard.writeText(url);
      
      setShowCopyTooltip(true);
      
      // Clear existing timeout
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      
      // Hide tooltip after 2 seconds
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowCopyTooltip(false);
      }, 2000);
    }
  };

  return (
    <div className="flex h-full bg-[#1a1a1a]">
      {/* Left Sidebar: Pavilion List */}
      <div className="w-72 border-r border-neutral-700 overflow-y-auto bg-[#0a0a0a]">
        <div className="p-4">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-white text-xl mb-2 font-mono tracking-wide">PAVILIONS</h2>
            <p className="text-neutral-500 text-xs font-mono">
              WALRUS SITES BROWSER
            </p>
          </div>

          {/* Pavilion List */}
          <div className="space-y-2">
            {PAVILION_KIOSKS.length === 0 ? (
              <div className="text-neutral-500 text-sm font-mono p-4 border border-neutral-800 rounded">
                <p className="mb-2">No Pavilions available</p>
                <p className="text-xs opacity-70">
                  Pavilions will appear here as they are added to the network.
                </p>
              </div>
            ) : (
              PAVILION_KIOSKS.map((pavilion) => (
                <button
                  key={pavilion.id}
                  onClick={() => handlePavilionSelect(pavilion)}
                  className={`w-full text-left p-3 border rounded transition-all duration-200 ${
                    selectedPavilion?.id === pavilion.id
                      ? 'border-white/30 bg-neutral-800'
                      : 'border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  {/* Pavilion Name */}
                  <div className="text-white text-sm font-medium mb-2 font-mono">
                    {pavilion.name}
                  </div>

                  {/* Category Badge */}
                  {pavilion.category && (
                    <div className="mb-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-mono ${getCategoryColor(pavilion.category)}`}
                      >
                        {pavilion.category}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {pavilion.description && (
                    <p className="text-neutral-400 text-xs mb-2 line-clamp-2">
                      {pavilion.description}
                    </p>
                  )}

                  {/* Kiosk ID */}
                  <div className="text-neutral-600 text-xs font-mono truncate">
                    ID: {pavilion.kioskId.slice(0, 8)}...{pavilion.kioskId.slice(-6)}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Info Section */}
          <div className="mt-6 p-3 border border-neutral-800 rounded bg-neutral-900/30">
            <p className="text-neutral-500 text-xs font-mono leading-relaxed">
              <span className="text-white">ABOUT PAVILION:</span>
              <br />
              Walrus Sites enable decentralized web hosting on the Sui blockchain.
              Browse community-created pavilions showcasing 3D designs, galleries, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Browser Frame */}
      <div className="flex-1 flex flex-col bg-[#1a1a1a]">
        {/* Browser Chrome */}
        <div className="bg-[#0a0a0a] border-b border-neutral-700 p-3 flex items-center gap-3">
          {/* Navigation Buttons */}
          <div className="flex gap-2 items-center">
            {/* Back Button */}
            <button
              onClick={handleGoBack}
              disabled={!selectedPavilion}
              className="p-1.5 hover:bg-neutral-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Go back"
            >
              <svg
                className="w-4 h-4 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
          </div>

          {/* URL Bar */}
          <div className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-4 py-2 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
            <span className="flex-1 text-neutral-400 text-sm font-mono truncate">
              {selectedPavilion
                ? `pavilion-231.vercel.app/pavilion/visit?kioskId=${selectedPavilion.kioskId}`
                : 'Select a pavilion to visit'}
            </span>
            
            {/* Copy Button with Tooltip */}
            {selectedPavilion && (
              <div className="relative">
                <button
                  onClick={handleCopyUrl}
                  className="p-1.5 hover:bg-neutral-800 rounded transition-colors"
                  title="Copy URL"
                >
                  <svg
                    className="w-4 h-4 text-neutral-400 hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                
                {/* Tooltip */}
                {showCopyTooltip && (
                  <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-black/90 backdrop-blur-sm text-white text-xs font-mono rounded border border-white/20 whitespace-nowrap z-50 animate-fade-in">
                    ✓ Copied!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reload Button */}
          {selectedPavilion && (
            <button
              onClick={() => setSelectedPavilion({ ...selectedPavilion })}
              className="p-2 hover:bg-neutral-800 rounded transition-colors"
              title="Reload"
            >
              <svg
                className="w-4 h-4 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-white">
          {!selectedPavilion ? (
            /* Empty State */
            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600 bg-gradient-to-br from-neutral-100 to-neutral-200">
              <svg
                className="w-24 h-24 mb-6 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <h3 className="text-xl font-medium mb-2 text-neutral-700">
                Welcome to Pavilion Browser
              </h3>
              <p className="text-sm text-center max-w-md px-4">
                Select a Pavilion from the sidebar to explore decentralized Walrus Sites.
                Discover 3D designs, galleries, and community showcases.
              </p>
            </div>
          ) : (
            /* iframe Container */
            <>
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
                    <p className="text-sm text-neutral-600 font-mono">
                      Loading Pavilion...
                    </p>
                  </div>
                </div>
              )}

              {/* iframe */}
              <iframe
                key={selectedPavilion.id}
                src={getPavilionUrl(selectedPavilion.kioskId, true)}
                className="w-full h-full border-0"
                title={`Pavilion: ${selectedPavilion.name}`}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                onLoad={() => setIsLoading(false)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

