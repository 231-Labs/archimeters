import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { createDesignSeries, PACKAGE_ID, ARTLIER_STATE_ID } from '@/utils/transactions';
import { WindowName } from '@/types/index';
import { useState, useEffect } from 'react';
import { RetroConsole } from '../upload/components/animations/RetroConsole';

interface UploadStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
}

interface TestDesignSeriesWindowProps {
  onDragStart: (e: React.MouseEvent<Element>, name: WindowName) => void;
}

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  subSteps?: {
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'success' | 'error';
  }[];
}

export default function TestDesignSeriesWindow({ onDragStart }: TestDesignSeriesWindowProps) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [transactionDigest, setTransactionDigest] = useState<string>('');
  const [transactionError, setTransactionError] = useState<string>('');
  const [membershipId, setMembershipId] = useState<string>('');
  
  // 測試狀態控制
  const [showTestControls, setShowTestControls] = useState(false);
  const [simulatedConnected, setSimulatedConnected] = useState(true);
  const [simulatedMembership, setSimulatedMembership] = useState(true);
  const [simulatedTransaction, setSimulatedTransaction] = useState<'none' | 'success' | 'error'>('none');
  
  // Console 顯示控制
  const [showConsole, setShowConsole] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 'prepare',
      label: 'PREPARING FILES FOR UPLOAD',
      status: 'pending'
    },
    {
      id: 'upload',
      label: 'UPLOADING FILES TO WALRUS',
      status: 'pending',
      subSteps: [
        {
          id: 'upload-image',
          label: 'IMAGE FILE',
          status: 'pending'
        },
        {
          id: 'upload-algorithm',
          label: 'ALGORITHM FILE',
          status: 'pending'
        },
        {
          id: 'upload-metadata',
          label: 'METADATA FILE',
          status: 'pending'
        }
      ]
    },
    {
      id: 'transaction',
      label: 'EXECUTING MOVE FUNCTION',
      status: 'pending'
    },
    {
      id: 'verify',
      label: 'VERIFYING TRANSACTION RESULT',
      status: 'pending'
    }
  ]);

  // 模擬進度更新
  useEffect(() => {
    if (!showConsole || currentStep >= steps.length) return;

    const updateProgress = () => {
      setSteps(prev => {
        const newSteps = [...prev];
        const currentStepData = newSteps[currentStep];

        if (!currentStepData) return prev;

        // 如果當前步驟還是 pending，先將其改為 processing
        if (currentStepData.status === 'pending') {
          currentStepData.status = 'processing';
          return newSteps;
        }

        // 處理有子步驟的情況
        if (currentStepData.subSteps && currentStepData.subSteps.length > 0) {
          // 確保所有子步驟都已初始化
          if (currentStepData.subSteps.every(s => s.status === 'pending')) {
            currentStepData.subSteps[0].status = 'processing';
            return newSteps;
          }

          // 更新子步驟狀態
          let updatedAny = false;
          const subSteps = currentStepData.subSteps;
          currentStepData.subSteps = subSteps.map((subStep, idx) => {
            if (subStep.status === 'processing' && Math.random() > 0.6) { // 提高完成機率
              // 當前處理中的步驟完成，開始下一個步驟
              const nextIdx = idx + 1;
              if (nextIdx < subSteps.length) {
                subSteps[nextIdx].status = 'processing';
              }
              return { ...subStep, status: 'success' as const };
            }
            if (subStep.status === 'processing') {
              updatedAny = true;
            }
            return subStep;
          });

          // 檢查是否所有子步驟都完成
          if (!updatedAny && currentStepData.subSteps.every(s => s.status === 'success')) {
            setTimeout(() => setCurrentStep(s => s + 1), 500); // 縮短等待時間
            currentStepData.status = 'success';
          }

          return newSteps;
        }

        // 處理沒有子步驟的情況
        if (currentStepData.status === 'processing' && Math.random() > 0.4) { // 提高完成機率
          setTimeout(() => setCurrentStep(s => s + 1), 500); // 縮短等待時間
          currentStepData.status = 'success';
        }

        return newSteps;
      });
    };

    const interval = setInterval(updateProgress, 600); // 加快更新頻率
    return () => clearInterval(interval);
  }, [currentStep, showConsole]);

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

  // 模擬交易成功
  const simulateSuccess = () => {
    setTransactionDigest('0x123...abc');
    setTransactionError('');
    setSimulatedTransaction('success');
  };

  // 模擬交易失敗
  const simulateError = () => {
    setTransactionDigest('');
    setTransactionError('Transaction failed: insufficient funds');
    setSimulatedTransaction('error');
  };

  // 重置所有狀態
  const resetSimulation = () => {
    setTransactionDigest('');
    setTransactionError('');
    setSimulatedTransaction('none');
  };

  // 重置 Console
  const resetConsole = () => {
    setCurrentStep(0);
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', progress: 0 })));
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* 測試控制面板 */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={() => setShowTestControls(!showTestControls)}
          className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded border border-gray-700 hover:bg-gray-700 transition-colors"
        >
          {showTestControls ? 'Hide Controls' : 'Show Controls'}
        </button>
        <button
          onClick={() => {
            setShowConsole(!showConsole);
            if (!showConsole) resetConsole();
          }}
          className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded border border-gray-700 hover:bg-gray-700 transition-colors"
        >
          {showConsole ? 'Hide Console' : 'Show Console'}
        </button>
      </div>
      
      {showTestControls && (
        <div className="absolute top-10 right-2 mt-2 p-3 bg-gray-900/80 rounded border border-gray-800 backdrop-blur-sm z-10">
          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400">Wallet Connection:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSimulatedConnected(true)}
                  className={`px-2 py-1 text-xs rounded border ${
                    simulatedConnected
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  Connected
                </button>
                <button
                  onClick={() => setSimulatedConnected(false)}
                  className={`px-2 py-1 text-xs rounded border ${
                    !simulatedConnected
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  Disconnected
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400">Membership Status:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSimulatedMembership(true)}
                  className={`px-2 py-1 text-xs rounded border ${
                    simulatedMembership
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  Has Membership
                </button>
                <button
                  onClick={() => setSimulatedMembership(false)}
                  className={`px-2 py-1 text-xs rounded border ${
                    !simulatedMembership
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  No Membership
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400">Transaction Status:</label>
              <div className="flex gap-2">
                <button
                  onClick={simulateSuccess}
                  className={`px-2 py-1 text-xs rounded border ${
                    simulatedTransaction === 'success'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  Success
                </button>
                <button
                  onClick={simulateError}
                  className={`px-2 py-1 text-xs rounded border ${
                    simulatedTransaction === 'error'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  Error
                </button>
                <button
                  onClick={resetSimulation}
                  className={`px-2 py-1 text-xs rounded border ${
                    simulatedTransaction === 'none'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  None
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Console 視窗 */}
      {showConsole && (
        <div className="absolute inset-4 bg-black border border-gray-800 backdrop-blur-sm z-20 p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <RetroConsole 
            currentStep={currentStep}
            steps={steps}
          />
          <div className="absolute bottom-4 right-4">
            <button
              onClick={resetConsole}
              className="px-4 py-2 bg-gray-900 text-gray-400 rounded border border-gray-800 hover:bg-gray-800 hover:text-gray-300 transition-colors font-mono text-sm"
            >
              RESTART SEQUENCE
            </button>
          </div>
        </div>
      )}

      {/* 主要內容區域 */}
      <div className="flex-1 px-4 pb-4 relative">
        <div className="flex flex-col items-center justify-center h-full font-mono">
          <div className="text-lg text-white mb-4 relative">
            <span>Test Design Series Creation</span>
            <span className="cursor-blink">_</span>
          </div>

          {(currentAccount || simulatedConnected) ? (
            <div className="flex flex-col items-center space-y-4 relative">
              <div className="text-sm text-white/90 relative">
                Connected Address: {currentAccount?.address || '0x123...789'}
              </div>
              {(membershipId || simulatedMembership) ? (
                <>
                  <div className="text-sm text-white/90 relative">
                    Membership ID: {membershipId || '0xabc...def'}
                  </div>
                  <button
                    onClick={() => {
                      setShowConsole(true);
                      resetConsole();
                    }}
                    className="px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors relative group border border-gray-600"
                  >
                    Create Design Series
                  </button>
                </>
              ) : (
                <div className="text-sm text-gray-400 relative">
                  No membership found for this address
                </div>
              )}

              {transactionDigest && (
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg relative overflow-hidden border border-gray-800">
                  <div className="relative">
                    <div className="text-gray-300 mb-2 flex items-center">
                      Transaction Successful!
                    </div>
                    <div className="text-sm text-gray-500">Transaction Digest:</div>
                    <div className="font-mono text-sm text-gray-400 break-all">
                      {transactionDigest}
                    </div>
                  </div>
                </div>
              )}

              {transactionError && (
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg relative overflow-hidden border border-gray-700">
                  <div className="relative">
                    <div className="text-gray-400 mb-2">Transaction Failed</div>
                    <div className="text-sm text-gray-500">{transactionError}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400 relative">
              Please connect your wallet to continue
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 