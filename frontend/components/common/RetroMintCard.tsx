'use client';

import { useRef, useState, useEffect } from 'react';

interface RetroMintCardProps {
  imageUrl?: string;
  isGenerating?: boolean;
  isComplete?: boolean;
  sculptName?: string;
  atelierName?: string;
  atelierAuthor?: string;
  atelierDescription?: string;
  sculptOwner?: string;
}

export function RetroMintCard({ 
  imageUrl, 
  isGenerating = false, 
  isComplete = false,
  sculptName = 'Sculpt',
  atelierName = 'Unknown Atelier',
  atelierAuthor = 'Unknown',
  atelierDescription = '',
  sculptOwner = ''
}: RetroMintCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;

      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseXPos = e.clientX - centerX;
      const mouseYPos = e.clientY - centerY;

      // 計算旋轉
      const rotateXValue = (mouseYPos / (rect.height / 2)) * -17.5;
      const rotateYValue = (mouseXPos / (rect.width / 2)) * 17.5;
      const translateXValue = (mouseXPos / rect.width) * 20;
      const translateYValue = (mouseYPos / rect.height) * 20;

      // 計算相對位置 (0-1 範圍)
      const relativeX = ((e.clientX - rect.left) / rect.width);
      const relativeY = ((e.clientY - rect.top) / rect.height);

      setRotateX(rotateXValue);
      setRotateY(rotateYValue);
      setTranslateX(translateXValue);
      setTranslateY(translateYValue);
      setMouseX(relativeX);
      setMouseY(relativeY);
    };

    const handleMouseLeave = () => {
      setRotateX(0);
      setRotateY(0);
      setTranslateX(0);
      setTranslateY(0);
      setMouseX(0.5);
      setMouseY(0.5);
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative w-full aspect-[2.5/3.5] cursor-pointer"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="w-full h-full relative transition-transform duration-300 ease-out"
        style={{
          transform: `
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
            translateX(${translateX}px)
            translateY(${translateY}px)
          `,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Card Container - Retro Style */}
        <div
          className="w-full h-full relative overflow-hidden"
          style={{
            background: '#1a1a1a',
            borderTop: '3px solid #555',
            borderLeft: '3px solid #555',
            borderBottom: '3px solid #000',
            borderRight: '3px solid #000',
            boxShadow: `
              inset 2px 2px 4px rgba(255, 255, 255, 0.1),
              inset -2px -2px 4px rgba(0, 0, 0, 0.8),
              0 4px 8px rgba(0, 0, 0, 0.5)
            `,
          }}
        >
          {/* Image Frame - MTG Style */}
          <div className="absolute top-3 left-3 right-3 bottom-24">
            <div 
              className="relative w-full h-full rounded-lg overflow-hidden"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
              }}
            >
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={sculptName}
                  className="w-full h-full object-cover"
                  style={{
                    imageRendering: 'crisp-edges',
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
                  <div className="text-white/20 text-6xl font-mono">?</div>
                </div>
              )}

              {/* Dynamic Holographic Reflection */}
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: `
                    radial-gradient(
                      circle at ${mouseX * 100}% ${mouseY * 100}%,
                      rgba(100, 200, 255, 0.3) 0%,
                      rgba(200, 100, 255, 0.2) 25%,
                      rgba(255, 100, 200, 0.1) 50%,
                      transparent 70%
                    )
                  `,
                  opacity: mouseX > 0 ? 0.6 : 0,
                  mixBlendMode: 'screen',
                }}
              />

              {/* Inner Frame Glow */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.9)',
                }}
              />

              {/* CRT Scanline Effect (when minting) */}
              {isGenerating && (
                <>
                  {/* Scanline moving from top to bottom */}
                  <div 
                    className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden"
                    style={{
                      background: `
                        repeating-linear-gradient(
                          0deg,
                          rgba(255, 255, 255, 0.1) 0px,
                          rgba(255, 255, 255, 0.05) 1px,
                          transparent 2px,
                          transparent 3px
                        )
                      `,
                      animation: 'scanline 3s linear infinite',
                    }}
                  />
                  
                  {/* Static Noise */}
                  <div 
                    className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none rounded-lg"
                    style={{
                      backgroundImage: `
                        repeating-linear-gradient(
                          0deg,
                          transparent,
                          transparent 1px,
                          rgba(255, 255, 255, 0.08) 2px
                        ),
                        repeating-linear-gradient(
                          90deg,
                          transparent,
                          transparent 1px,
                          rgba(255, 255, 255, 0.08) 2px
                        )
                      `,
                      animation: 'flicker 0.15s infinite',
                    }}
                  />
                </>
              )}

              {/* Complete Shine Effect - Flash once only */}
              {isComplete && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                    animation: 'shine 1.5s ease-out 1',
                    animationFillMode: 'forwards',
                    opacity: 0,
                  }}
                />
              )}
            </div>
          </div>

          {/* Card Footer Info Panel - Retro Style */}
          <div 
            className="absolute bottom-0 left-0 right-0 p-3"
            style={{
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(33, 33, 33, 0.7) 70%, transparent 100%)',
            }}
          >
            {/* Sculpt Name */}
            <div 
              className="mb-2 pb-2"
              style={{
                borderBottom: '2px solid #444',
                borderTop: '2px solid #000',
                boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5)',
                background: '#1a1a1a',
                padding: '6px 8px',
              }}
            >
              <div className="text-white/90 text-sm font-mono uppercase tracking-wide truncate">
                {sculptName}
              </div>
            </div>

            {/* Atelier Info - Retro Panel Style */}
            <div 
              className="space-y-1"
              style={{
                background: '#1a1a1a',
                borderTop: '2px solid #444',
                borderLeft: '2px solid #444',
                borderBottom: '2px solid #000',
                borderRight: '2px solid #000',
                boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5)',
                padding: '6px 8px',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[9px] font-mono uppercase tracking-wider">Atelier</span>
                <span className="text-white/80 text-[10px] font-mono truncate ml-2 max-w-[60%]">
                  {atelierName}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[9px] font-mono uppercase tracking-wider">Artist</span>
                <span className="text-white/80 text-[10px] font-mono truncate ml-2 max-w-[60%]">
                  {atelierAuthor}
                </span>
              </div>

              {sculptOwner && (
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-[9px] font-mono uppercase tracking-wider">Owner</span>
                  <span className="text-white/70 text-[10px] font-mono truncate ml-2 max-w-[60%]">
                    {sculptOwner}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        
        @keyframes shine {
          0% { 
            transform: translateX(-100%) translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% { 
            transform: translateX(100%) translateY(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

