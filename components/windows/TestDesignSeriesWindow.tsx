import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { retroButtonStyles } from '@/styles/components';
import { createDesignSeries } from '@/utils/transactions';
import { WindowName } from '@/types/index';

interface TestDesignSeriesWindowProps {
  onDragStart: (e: React.MouseEvent<Element>, name: WindowName) => void;
}

export default function TestDesignSeriesWindow({ onDragStart }: TestDesignSeriesWindowProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const handleCreateDesignSeries = async () => {
    if (!currentAccount?.address) return;

    try {
      // 寫死的測試參數
      const membershipId = '0x0949fabd63b4b98b67834fd2b9e120a9e1d15665bf368e16cde8fbce289b790d';
      const testParams = {
        photo: 'https://example.com/test-photo.jpg',
        website: 'https://example.com',
        algorithm: 'test-algorithm',
      };

      // 創建交易
      const tx = await createDesignSeries(
        membershipId,
        testParams.photo,
        testParams.website,
        testParams.algorithm
      );

      // 執行交易
      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            console.log('Transaction successful:', result);
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
          },
        }
      );
    } catch (error) {
      console.error('Error creating design series:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connect Button 區域 */}
      <div className="pt-6 px-4 flex justify-center">
        <ConnectButton 
          style={retroButtonStyles.button} 
          onMouseOver={e => Object.assign(e.currentTarget.style, retroButtonStyles.buttonHover)}
          onMouseOut={e => Object.assign(e.currentTarget.style, retroButtonStyles.button)}
          connectText="Connect Wallet"
          className="retro-button"
        />
      </div>

      {/* 主要內容區域 */}
      <div className="flex-1 px-4 pb-4">
        <div className="flex flex-col items-center justify-center h-full font-mono">
          <div className="text-lg text-white mb-4">
            <span>Test Design Series Creation</span>
            <span className="cursor-blink">_</span>
          </div>

          {currentAccount ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="text-sm text-white/90">
                Connected Address: {currentAccount.address}
              </div>
              <button
                onClick={handleCreateDesignSeries}
                className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Create Design Series
              </button>
            </div>
          ) : (
            <div className="text-sm text-white/90">
              Please connect your wallet to continue
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 