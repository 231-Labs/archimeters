import { useState } from 'react';

interface BasicInfoPageProps {
  workName: string;
  description: string;
  price: string;
  name: string;
  social: string;
  intro: string;
  imageFile: File | null;
  imageUrl: string;
  onWorkNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onIntroChange: (value: string) => void;
  onImageFileChange: (file: File) => void;
  workNameRequired: boolean;
  descriptionRequired: boolean;
  priceRequired: boolean;
  introRequired: boolean;
  imageRequired: boolean;
  priceError: string;
}

export const BasicInfoPage = ({
  workName,
  description,
  price,
  name,
  social,
  intro,
  imageFile,
  imageUrl,
  onWorkNameChange,
  onDescriptionChange,
  onPriceChange,
  onIntroChange,
  onImageFileChange,
  workNameRequired,
  descriptionRequired,
  priceRequired,
  introRequired,
  imageRequired,
  priceError
}: BasicInfoPageProps) => {
  return (
    <div className="flex h-full">
      {/* Left - Basic Info */}
      <div className="w-1/2 px-7 py-5 border-r border-white/5 flex flex-col">
        <div className="w-full space-y-5 flex-1">
          {/* Artwork Title */}
          <div>
            <input
              value={workName}
              onChange={(e) => onWorkNameChange(e.target.value)}
              className={`w-full bg-transparent text-white text-2xl font-light border-b ${workNameRequired ? 'border-red-400' : 'border-white/20'} pb-1.5 focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20`}
              placeholder="Enter artwork title..."
            />
            {workNameRequired && (
              <div className="mt-1.5 text-red-400 text-sm">
                Artwork title is required
              </div>
            )}
          </div>

          {/* Artwork Description */}
          <div>
            <div className="text-white/50 text-sm mb-2">Artwork Description</div>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className={`w-full h-24 bg-transparent text-white/90 focus:outline-none resize-none placeholder:text-white/20 border-b ${descriptionRequired ? 'border-red-400' : 'border-white/20'}`}
              placeholder="Describe your artwork and creative concept..."
            />
            {descriptionRequired && (
              <div className="mt-1.5 text-red-400 text-sm">
                Artwork description is required
              </div>
            )}
          </div>

          {/* Artist Info */}
          <div className="space-y-3">
            <div className="text-white/50 text-sm">Artist Information</div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 text-white/90 pb-1.5">
                {name}
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center flex-1">
                <span className="text-white/50 mr-2">@</span>
                <div className="text-white/90 pb-1.5">
                  {social}
                </div>
              </div>
            </div>
            <textarea
              value={intro}
              onChange={(e) => onIntroChange(e.target.value)}
              className={`w-full h-20 bg-transparent text-white/90 focus:outline-none resize-none placeholder:text-white/20 border-b ${introRequired ? 'border-red-400' : 'border-white/20'}`}
              placeholder="Introduce yourself as an artist..."
            />
            {introRequired && (
              <div className="mt-1.5 text-red-400 text-sm">
                Artist introduction is required
              </div>
            )}
          </div>

          {/* Artwork Price */}
          <div>
            <div className="text-white/50 text-sm mb-2">Artwork Price</div>
            <div className="flex items-center gap-4">
              {/* <svg width="18" height="30" viewBox="0 0 300 384" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M240.057 159.914C255.698 179.553 265.052 204.39 265.052 231.407C265.052 258.424 255.414 284.019 239.362 303.768L237.971 305.475L237.608 303.31C237.292 301.477 236.929 299.613 236.502 297.749C228.46 262.421 202.265 232.134 159.148 207.597C130.029 191.071 113.361 171.195 108.985 148.586C106.157 133.972 108.258 119.294 112.318 106.717C116.379 94.1569 122.414 83.6187 127.549 77.2831L144.328 56.7754C147.267 53.1731 152.781 53.1731 155.719 56.7754L240.073 159.914H240.057ZM266.584 139.422L154.155 1.96703C152.007 -0.655678 147.993 -0.655678 145.845 1.96703L33.4316 139.422L33.0683 139.881C12.3868 165.555 0 198.181 0 233.698C0 316.408 67.1635 383.461 150 383.461C232.837 383.461 300 316.408 300 233.698C300 198.181 287.613 165.555 266.932 139.896L266.568 139.438L266.584 139.422ZM60.3381 159.472L70.3866 147.164L70.6868 149.439C70.9237 151.24 71.2239 153.041 71.5715 154.858C78.0809 189.001 101.322 217.456 140.173 239.496C173.952 258.724 193.622 280.828 199.278 305.064C201.648 315.176 202.059 325.129 201.032 333.835L200.969 334.372L200.479 334.609C185.233 342.05 168.09 346.237 149.984 346.237C86.4546 346.237 34.9484 294.826 34.9484 231.391C34.9484 204.153 44.4439 179.142 60.3065 159.44L60.3381 159.472Z" fill="white"/>
              </svg> */}
              <img src="/Sui_Symbol_White.png" alt="Sui Symbol" width={18} height={30} />
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
                className={`flex-1 bg-transparent text-white text-xl border-b ${priceRequired ? 'border-red-400' : 'border-white/20'} pb-1.5 focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20`}
                placeholder="Set artwork price..."
              />
            </div>
            {priceError && (
              <div className="mt-1.5 text-red-400 text-sm">
                {priceError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right - Main Visual Upload */}
      <div className="w-1/2 px-7 py-5 flex flex-col">
        <div className="text-white/50 text-sm mb-3">Main Visual</div>
        <div className="flex-1 group relative">
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageFileChange(file);
            }}
            className="w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer"
          />
          <div className={`h-full border border-dashed ${imageRequired ? 'border-red-400' : 'border-white/20'} rounded-lg flex items-center justify-center ${!imageRequired && 'group-hover:border-white/40'} transition-colors overflow-hidden`}>
            {imageFile ? (
              <img src={imageUrl} alt="Preview" className="max-h-full max-w-full object-contain p-2" />
            ) : (
              <div className="text-center p-4">
                <div className={`text-4xl mb-2 ${imageRequired ? 'text-red-400' : 'text-white/40'}`}>+</div>
                <div className={`text-sm ${imageRequired ? 'text-red-400' : 'text-white/40'}`}>
                  {imageRequired ? 'Main visual is required' : 'Click or drag to upload image'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 