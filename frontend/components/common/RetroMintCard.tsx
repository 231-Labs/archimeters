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
        {/* Card Container with Trading Card Border */}
        <div
          className="w-full h-full relative overflow-hidden rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
            borderTop: '4px solid #555',
            borderLeft: '4px solid #555',
            borderBottom: '4px solid #000',
            borderRight: '4px solid #000',
            boxShadow: `
              inset 0 0 0 2px rgba(100, 200, 255, 0.15),
              inset 3px 3px 6px rgba(255, 255, 255, 0.08),
              inset -3px -3px 6px rgba(0, 0, 0, 0.8),
              0 10px 30px rgba(0, 0, 0, 0.9),
              0 0 20px rgba(0, 0, 0, 0.5)
            `,
          }}
        >
          {/* Decorative Corner Marks */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/30" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/30" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/30" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/30" />

          {/* Card Header */}
          <div 
            className="absolute top-0 left-0 right-0 z-10 px-3 py-2"
            style={{
              background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6))',
              borderBottom: '1px solid rgba(100, 200, 255, 0.2)',
            }}
          >
            <div className="flex items-center justify-center">
              <div className="text-cyan-400 text-[10px] font-mono uppercase tracking-widest">
                Archimeters Sculpt
              </div>
            </div>
          </div>
          {/* Image Frame */}
          <div className="absolute inset-0 flex items-center justify-center p-4 pt-12">
            <div 
              className="relative w-full h-full rounded overflow-hidden"
              style={{
                border: '2px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
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

              {/* CRT Scanlines Effect (when generating) */}
              {isGenerating && (
                <>
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `
                        repeating-linear-gradient(
                          0deg,
                          rgba(0, 255, 0, 0.03) 0px,
                          rgba(0, 0, 0, 0.05) 1px,
                          rgba(0, 255, 0, 0.03) 2px
                        )
                      `,
                      animation: 'scanline 8s linear infinite',
                    }}
                  />
                  
                  {/* Static Noise */}
                  <div 
                    className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
                    style={{
                      backgroundImage: `
                        repeating-linear-gradient(
                          0deg,
                          transparent,
                          transparent 2px,
                          rgba(255, 255, 255, 0.03) 4px
                        ),
                        repeating-linear-gradient(
                          90deg,
                          transparent,
                          transparent 2px,
                          rgba(255, 255, 255, 0.03) 4px
                        )
                      `,
                      animation: 'flicker 0.15s infinite',
                    }}
                  />

                  {/* Generating Overlay */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-green-500/30 rounded" />
                        <div 
                          className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded animate-spin"
                          style={{ animationDuration: '1s' }}
                        />
                      </div>
                      <div className="text-green-400 text-sm font-mono uppercase tracking-widest animate-pulse">
                        Generating...
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Complete Shine Effect */}
              {isComplete && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                    animation: 'shine 2s ease-in-out',
                  }}
                />
              )}

              {/* Holographic Border Glow (when complete) */}
              {isComplete && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: `
                      inset 0 0 20px rgba(100, 200, 255, 0.4),
                      0 0 30px rgba(100, 200, 255, 0.3)
                    `,
                    animation: 'glow 2s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          </div>

          {/* Card Footer Info Panel */}
          <div 
            className="absolute bottom-0 left-0 right-0 p-3"
            style={{
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.8) 80%, transparent 100%)',
              borderTop: '1px solid rgba(100, 200, 255, 0.2)',
            }}
          >
            {/* Sculpt Name */}
            <div className="mb-2">
              <div className="text-white/50 text-[9px] font-mono uppercase tracking-widest mb-0.5">
                Sculpt Name
              </div>
              <div className="text-white/95 text-sm font-mono uppercase tracking-wide truncate">
                {sculptName}
              </div>
            </div>

            {/* Atelier Info */}
            <div 
              className="space-y-1.5 pt-2 mb-2"
              style={{
                borderTop: '1px solid rgba(100, 200, 255, 0.15)',
              }}
            >
              <div>
                <div className="text-white/40 text-[8px] font-mono uppercase tracking-widest mb-0.5">
                  Atelier
                </div>
                <div className="text-cyan-400/90 text-[11px] font-mono truncate">
                  {atelierName}
                </div>
              </div>
              
              <div>
                <div className="text-white/40 text-[8px] font-mono uppercase tracking-widest mb-0.5">
                  Author
                </div>
                <div className="text-white/70 text-[11px] font-mono truncate">
                  {atelierAuthor}
                </div>
              </div>

              {atelierDescription && (
                <div>
                  <div className="text-white/40 text-[8px] font-mono uppercase tracking-widest mb-0.5">
                    Description
                  </div>
                  <div className="text-white/60 text-[10px] font-mono line-clamp-2 leading-tight">
                    {atelierDescription}
                  </div>
                </div>
              )}

              {sculptOwner && (
                <div>
                  <div className="text-white/40 text-[8px] font-mono uppercase tracking-widest mb-0.5">
                    Owner
                  </div>
                  <div className="text-purple-400/80 text-[10px] font-mono truncate">
                    {sculptOwner}
                  </div>
                </div>
              )}
            </div>
            
            {/* Status Indicator */}
            {isGenerating && (
              <div 
                className="flex items-center gap-2 pt-1.5"
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex-1 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50 animate-pulse" />
                  <span className="text-yellow-400/80 text-[10px] font-mono uppercase tracking-widest">
                    Minting...
                  </span>
                </div>
              </div>
            )}

            {isComplete && (
              <div 
                className="flex items-center justify-center gap-1.5 pt-1.5"
                style={{
                  borderTop: '1px solid rgba(100, 200, 255, 0.15)',
                }}
              >
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-cyan-400 text-[10px] font-mono uppercase tracking-widest">
                  Minted
                </span>
              </div>
            )}
          </div>

          {/* Holographic Overlay Pattern */}
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 10px,
                  rgba(100, 200, 255, 0.1) 10px,
                  rgba(100, 200, 255, 0.1) 11px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 10px,
                  rgba(100, 200, 255, 0.1) 10px,
                  rgba(100, 200, 255, 0.1) 11px
                )
              `,
            }}
          />
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
          0% { transform: translateX(-100%) translateY(-100%); }
          100% { transform: translateX(100%) translateY(100%); }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

