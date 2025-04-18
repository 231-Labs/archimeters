import React, { useState, useEffect } from 'react';
import { Space_Mono, IBM_Plex_Mono } from 'next/font/google';

const spaceMono = Space_Mono({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-space-mono',
});

const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-ibm-plex',
});

const FIXED_BLOB_ID = 'y4VFh6Wh6PEfmESDQaOWn3KQNbpI3-wT6W-mC1LzAVo';

const ElegantPage: React.FC = () => {
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchImage();
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, []);

  const fetchImage = async () => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl('');
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/walrus/blob/${FIXED_BLOB_ID}`);
      
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fetch failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full h-full bg-black text-white overflow-auto ${spaceMono.variable} ${ibmPlexMono.variable} font-mono`}>
      {/* Grid overlay */}
      <div className="fixed inset-0 bg-[url('/grid.png')] opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

      <div className="relative max-w-2xl mx-auto p-6">
        <header className="mb-16 relative text-center">
          {/* Terminal-style header */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-32 h-32">
            <div className="absolute inset-0 border border-white/10 rounded-sm"></div>
            <div className="absolute inset-4 border border-white/5 rounded-sm"></div>
          </div>
          
          <h1 className={`text-5xl font-bold mb-4 tracking-tight ${spaceMono.className}`}>
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/80">
              Art Space Active_
            </span>
          </h1>
          <p className={`text-base text-white/40 font-normal tracking-[0.5em] uppercase ${ibmPlexMono.className}`}>
            Bridging Reality & Digital Geometry
          </p>

          {/* Geometric line */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="h-px mt-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
        </header>

        <section className="mb-16 relative">
          <div className="max-w-xl mx-auto">
            {/* Terminal frame */}
            <div className="relative p-[1px] bg-gradient-to-r from-white/10 via-white/5 to-white/10">
              <div className="relative bg-black/50 backdrop-blur-sm p-6">
                {/* Corner markers */}
                <div className="absolute left-0 top-0 w-6 h-6 border-l border-t border-white/20"></div>
                <div className="absolute right-0 top-0 w-6 h-6 border-r border-t border-white/20"></div>
                <div className="absolute left-0 bottom-0 w-6 h-6 border-l border-b border-white/20"></div>
                <div className="absolute right-0 bottom-0 w-6 h-6 border-r border-b border-white/20"></div>

                <h2 className={`text-2xl font-semibold mb-4 text-center text-white/90 ${spaceMono.className} tracking-wide`}>
                  Display Output_
                </h2>

                <div className="relative min-h-[280px] max-h-[280px] bg-black/70 overflow-hidden border border-white/10">
                  {error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-400/80 p-3 font-mono text-sm">
                      {error}
                    </div>
                  ) : isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-8 h-8">
                        <div className="absolute inset-0 border-t border-white/20 rounded-none animate-spin"></div>
                        <div className="absolute inset-2 border-t border-white/10 rounded-none animate-spin-slow"></div>
                      </div>
                    </div>
                  ) : blobUrl ? (
                    <div className="relative group h-[280px]">
                      <img 
                        src={blobUrl} 
                        alt="Design output"
                        className="w-full h-full object-contain transition-all duration-1000 group-hover:contrast-125 group-hover:brightness-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30"></div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="group">
            <div className="relative p-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent">
              <div className="relative bg-black/50 backdrop-blur-sm p-4">
                <div className="absolute left-0 top-0 w-4 h-4 border-l border-t border-white/20"></div>
                <div className="absolute right-0 bottom-0 w-4 h-4 border-r border-b border-white/20"></div>
                <h2 className={`text-lg font-semibold mb-2 text-white/90 ${spaceMono.className}`}>Parametric Design_</h2>
                <p className={`text-sm text-white/60 leading-relaxed ${ibmPlexMono.className}`}>
                  Exploring geometric possibilities through computational algorithms.
                </p>
              </div>
            </div>
          </div>
          <div className="group">
            <div className="relative p-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent">
              <div className="relative bg-black/50 backdrop-blur-sm p-4">
                <div className="absolute left-0 top-0 w-4 h-4 border-l border-t border-white/20"></div>
                <div className="absolute right-0 bottom-0 w-4 h-4 border-r border-b border-white/20"></div>
                <h2 className={`text-lg font-semibold mb-2 text-white/90 ${spaceMono.className}`}>Digital Space_</h2>
                <p className={`text-sm text-white/60 leading-relaxed ${ibmPlexMono.className}`}>
                  Creating virtual environments with mathematical precision.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 relative">
          <div className="relative p-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent">
            <div className="relative bg-black/50 backdrop-blur-sm p-6">
              <div className="absolute left-0 top-0 w-6 h-6 border-l border-t border-white/20"></div>
              <div className="absolute right-0 top-0 w-6 h-6 border-r border-t border-white/20"></div>
              <div className="absolute left-0 bottom-0 w-6 h-6 border-l border-b border-white/20"></div>
              <div className="absolute right-0 bottom-0 w-6 h-6 border-r border-b border-white/20"></div>

              <h2 className={`text-2xl font-semibold mb-8 text-center text-white/90 ${spaceMono.className}`}>
                System Architecture_
              </h2>
              <ul className="space-y-6">
                <li className="relative">
                  <div className="pl-6">
                    <h3 className={`text-lg font-semibold mb-2 text-white/90 ${spaceMono.className}`}>Grid System_</h3>
                    <p className={`text-sm text-white/60 leading-relaxed ${ibmPlexMono.className}`}>
                      Establishing order through mathematical grid structures.
                    </p>
                  </div>
                </li>
                <li className="relative">
                  <div className="pl-6">
                    <h3 className={`text-lg font-semibold mb-2 text-white/90 ${spaceMono.className}`}>Vector Space_</h3>
                    <p className={`text-sm text-white/60 leading-relaxed ${ibmPlexMono.className}`}>
                      Manipulating digital geometry in multi-dimensional space.
                    </p>
                  </div>
                </li>
                <li className="relative">
                  <div className="pl-6">
                    <h3 className={`text-lg font-semibold mb-2 text-white/90 ${spaceMono.className}`}>Digital Matrix_</h3>
                    <p className={`text-sm text-white/60 leading-relaxed ${ibmPlexMono.className}`}>
                      Transforming concepts into computational reality.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="text-center text-white/40 relative">
          <div className="mb-3 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <p className={`text-xs tracking-[0.3em] uppercase ${ibmPlexMono.className}`}>Terminal Session Active_ © 2024</p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 8s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ElegantPage; 