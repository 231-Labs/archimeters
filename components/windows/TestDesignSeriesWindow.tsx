import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { retroButtonStyles } from '@/styles/components';
import { createDesignSeries, PACKAGE_ID, ARTLIER_STATE_ID } from '@/utils/transactions';
import { WindowName } from '@/types/index';
import { useState, useEffect } from 'react';

interface TestDesignSeriesWindowProps {
  onDragStart: (e: React.MouseEvent<Element>, name: WindowName) => void;
}

export default function TestDesignSeriesWindow({ onDragStart }: TestDesignSeriesWindowProps) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [transactionDigest, setTransactionDigest] = useState<string>('');
  const [transactionError, setTransactionError] = useState<string>('');
  const [membershipId, setMembershipId] = useState<string>('');

  useEffect(() => {
    const fetchMembership = async () => {
      if (!currentAccount?.address) return;

      try {
        const { data: objects } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            StructType: `${PACKAGE_ID}::archimeters::MemberShip`
          },
          options: {
            showType: true,
          }
        });

        if (objects && objects.length > 0) {
          setMembershipId(objects[0].data?.objectId || '');
        }
      } catch (error) {
        console.error('Error fetching membership:', error);
      }
    };

    fetchMembership();
  }, [currentAccount, suiClient]);

  const handleCreateDesignSeries = async () => {
    if (!currentAccount?.address || !membershipId) return;

    try {
      const testParams = {
        artlierState: ARTLIER_STATE_ID,
        membershipId,
        photo: 'C8oceDAg7Jo3n1B5c86qL_SBJBb_VfTzNj2oe2Wj7S0',
        data: '8DtG3IretlrZ7lyGTV2JTVmXDbG30winAJfxBbe6pAw',
        algorithm: 'Wh1Iu8x0QyP9NlaTx4f5BLPxPgaCJ8Fls3tChRKT078',
        clock: '0x6',
        price: 1000,
      };

      // 創建交易
      const tx = await createDesignSeries(
        testParams.artlierState,
        testParams.membershipId,
        testParams.photo,
        testParams.data,
        testParams.algorithm,
        testParams.clock,
        testParams.price
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
            setTransactionDigest(result.digest);
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            setTransactionError(error.message);
          },
        }
      );
    } catch (error) {
      console.error('Error creating design series:', error);
      setTransactionError(error instanceof Error ? error.message : String(error));
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
              {membershipId ? (
                <>
                  <div className="text-sm text-white/90">
                    Membership ID: {membershipId}
                  </div>
                  <button
                    onClick={handleCreateDesignSeries}
                    className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Create Design Series
                  </button>
                </>
              ) : (
                <div className="text-sm text-red-400">
                  No membership found for this address
                </div>
              )}

              {transactionDigest && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                  <div className="text-green-400 mb-2">Transaction Successful!</div>
                  <div className="text-sm text-white/70">Transaction Digest:</div>
                  <div className="font-mono text-sm text-white/90 break-all">
                    {transactionDigest}
                  </div>
                </div>
              )}

              {transactionError && (
                <div className="mt-4 p-4 bg-red-900/20 rounded-lg">
                  <div className="text-red-400 mb-2">Transaction Failed</div>
                  <div className="text-sm text-red-400">{transactionError}</div>
                </div>
              )}
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