import { useState } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';

interface Atelier {
  id: string;
  photoBlobId: string;
  title: string;
  author: string;
  price: string;
  isLoading: boolean;
  error: string | null;
}

interface ImageItemProps {
  atelier: Atelier;
}

export function ImageItem({ atelier }: ImageItemProps) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '100px' });
  const [loaded, setLoaded] = useState(false);

  if (atelier.isLoading) {
    return <div className="w-full aspect-square bg-neutral-800/50 animate-pulse rounded-sm" />;
  }

  if (atelier.error) {
    return (
      <div className="w-full aspect-square bg-red-900/20 flex items-center justify-center rounded-sm">
        <p className="text-red-500 text-sm">{atelier.error}</p>
      </div>
    );
  }

  return (
    <button
      className="relative group w-full outline-none transition-all"
      onClick={() => console.log('handleImageClick atelier: ', atelier)}
      disabled={!atelier.photoBlobId}
      ref={ref}
    >
      <div className="relative w-full">
        <div className="absolute inset-0 bg-neutral-800/50 animate-pulse rounded-sm z-0" />
        {inView && (
          <Image
            src={`/api/image-proxy?blobId=${atelier.photoBlobId}`}
            alt={atelier.title}
            width={1200}
            height={800}
            quality={90}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/2wCEAAEBAQEBAQEBAQEBAQECAgICAgICAgICAgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAALCAA4ADgBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z"
            onLoad={() => setLoaded(true)}
            className={`w-full h-auto object-cover rounded-sm shadow-md opacity-0 transition-opacity duration-500 group-hover:scale-[1.02] ${
              loaded ? 'opacity-100' : ''
            }`}
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1400px) 33vw, 25vw"
          />
        )}
      </div>
    </button>
  );
} 