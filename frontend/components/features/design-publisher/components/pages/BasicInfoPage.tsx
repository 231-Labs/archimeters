import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';

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
  onMembershipDataChange: (data: MembershipData | null) => void;
  workNameRequired: boolean;
  descriptionRequired: boolean;
  priceRequired: boolean;
  introRequired: boolean;
  imageRequired: boolean;
  priceError: string;
}

const MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`;

interface MembershipData {
  username: string;
  description: string;
  address: string;
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
  onMembershipDataChange,
  workNameRequired,
  descriptionRequired,
  priceRequired,
  introRequired,
  imageRequired,
  priceError
}: BasicInfoPageProps) => {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);

  useEffect(() => {
    const fetchMembershipData = async () => {
      if (!currentAccount?.address) return;

      try {
        const { data: objects } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            StructType: MEMBERSHIP_TYPE
          },
          options: {
            showType: true,
            showContent: true,
          }
        });

        if (objects && objects.length > 0) {
          const membership = objects[0].data?.content;
          if (membership && 'fields' in membership) {
            const fields = membership.fields as Record<string, unknown>;
            const data = {
              username: String(fields.username || ''),
              description: String(fields.description || ''),
              address: currentAccount.address
            };
            setMembershipData(data);
            onMembershipDataChange(data);
          }
        }
      } catch (error) {
        console.error('Error fetching membership data:', error);
      }
    };

    fetchMembershipData();
  }, [currentAccount, suiClient, onMembershipDataChange]);

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
                {membershipData?.username || name}
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center flex-1">
                <span className="text-white/50 mr-2">@</span>
                <div className="text-white/90 pb-1.5">
                  {membershipData?.address ? membershipData.address.slice(0, 6) + '...' + membershipData.address.slice(-4) : social}
                </div>
              </div>
            </div>
            <textarea
              value={membershipData?.description || intro}
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
              <img src="/sui_symbol_white.png" alt="Sui Symbol" width={18} height={30} />
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