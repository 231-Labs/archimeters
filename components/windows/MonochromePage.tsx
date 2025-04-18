import { Playfair_Display, Cormorant } from 'next/font/google';
import { useEffect, useState } from 'react';

const playfair = Playfair_Display({ subsets: ['latin'] });
const cormorant = Cormorant({ subsets: ['latin'] });

const BLOB_ID = 'y4VFh6Wh6PEfmESDQaOWn3KQNbpI3-wT6W-mC1LzAVo';
const AGGREGATOR_URL = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space';
const IMAGE_URL = `${AGGREGATOR_URL}/v1/blobs/${BLOB_ID}`;

export default function MonochromePage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      
      try {
        const response = await fetch(IMAGE_URL);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching image:', err);
        setError('Failed to load image');
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []);

  return (
    <div className={`w-full h-full bg-[#f8f8f8] text-gray-900 overflow-auto font-serif`}>
      {/* Grid overlay */}
      <div className="fixed inset-0 bg-[url('/grid.png')] opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

      <div className="relative max-w-2xl mx-auto p-6">
        <header className="mb-16 relative text-center">
          {/* Terminal-style header */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-32 h-32">
            <div className="absolute inset-0 border border-gray-300/30 rounded-sm"></div>
            <div className="absolute inset-4 border border-gray-300/20 rounded-sm"></div>
          </div>
          
          <h1 className={`text-5xl font-bold mb-4 tracking-tight ${playfair.className}`}>
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700">
              Monochrome Space_
            </span>
          </h1>
          <p className={`text-base text-gray-600 font-normal tracking-[0.5em] uppercase ${cormorant.className}`}>
            Elegance in Black & White
          </p>

          {/* Geometric line */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent"></div>
            <div className="h-px mt-1 bg-gradient-to-r from-transparent via-gray-400/20 to-transparent"></div>
          </div>
        </header>

        <section className="mb-16 relative">
          <div className="max-w-xl mx-auto">
            {/* Terminal frame */}
            <div className="relative p-[1px] bg-gradient-to-r from-gray-300/30 via-gray-300/20 to-gray-300/30">
              <div className="relative bg-white/80 backdrop-blur-sm p-6">
                {/* Corner markers */}
                <div className="absolute left-0 top-0 w-6 h-6 border-l border-t border-gray-400/30"></div>
                <div className="absolute right-0 top-0 w-6 h-6 border-r border-t border-gray-400/30"></div>
                <div className="absolute left-0 bottom-0 w-6 h-6 border-l border-b border-gray-400/30"></div>
                <div className="absolute right-0 bottom-0 w-6 h-6 border-r border-b border-gray-400/30"></div>

                <h2 className={`text-2xl font-semibold mb-4 text-center text-gray-800 ${playfair.className} tracking-wide`}>
                  Display Output_
                </h2>

                <div className="relative min-h-[280px] max-h-[280px] bg-white/90 overflow-hidden border border-gray-300/30">
                  {error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500/80 p-3 font-mono text-sm">
                      {error}
                    </div>
                  ) : loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-8 h-8">
                        <div className="absolute inset-0 border-t border-gray-400/30 rounded-none animate-spin"></div>
                        <div className="absolute inset-2 border-t border-gray-400/20 rounded-none animate-spin-slow"></div>
                      </div>
                    </div>
                  ) : imageUrl ? (
                    <div className="relative group h-[280px]">
                      <img 
                        src={IMAGE_URL}
                        alt="Displayed content"
                        className="w-full h-full object-contain transition-all duration-1000 group-hover:contrast-110 group-hover:brightness-105"
                        onLoad={() => setLoading(false)}
                        onError={(e) => {
                          setError('Failed to load image');
                          setLoading(false);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent opacity-30"></div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="group">
            <div className="relative p-[1px] bg-gradient-to-r from-transparent via-gray-300/30 to-transparent">
              <div className="relative bg-white/80 backdrop-blur-sm p-4">
                <div className="absolute left-0 top-0 w-4 h-4 border-l border-t border-gray-400/30"></div>
                <div className="absolute right-0 bottom-0 w-4 h-4 border-r border-b border-gray-400/30"></div>
                <h2 className={`text-lg font-semibold mb-2 text-gray-800 ${playfair.className}`}>Classical Aesthetics_</h2>
                <p className={`text-sm text-gray-600 leading-relaxed ${cormorant.className}`}>
                  In the realm of monochromatic design, we find beauty in simplicity.
                </p>
              </div>
            </div>
          </div>
          <div className="group">
            <div className="relative p-[1px] bg-gradient-to-r from-transparent via-gray-300/30 to-transparent">
              <div className="relative bg-white/80 backdrop-blur-sm p-4">
                <div className="absolute left-0 top-0 w-4 h-4 border-l border-t border-gray-400/30"></div>
                <div className="absolute right-0 bottom-0 w-4 h-4 border-r border-b border-gray-400/30"></div>
                <h2 className={`text-lg font-semibold mb-2 text-gray-800 ${playfair.className}`}>Modern Interpretation_</h2>
                <p className={`text-sm text-gray-600 leading-relaxed ${cormorant.className}`}>
                  A contemporary approach to timeless design principles.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center text-gray-500 relative">
          <div className="mb-3 w-full h-px bg-gradient-to-r from-transparent via-gray-400/20 to-transparent"></div>
          <p className={`text-xs tracking-[0.3em] uppercase ${cormorant.className}`}>Monochrome Session Active_ © 2024</p>
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
} 