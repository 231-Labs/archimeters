'use client';

import * as Tabs from '@radix-ui/react-tabs';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect, useRef } from 'react';
import { useUserItems, VaultItem, AtelierItem, SculptItem } from '@/components/features/vault/hooks/useUserItems';
import { usePrinters, Printer } from '@/components/features/vault/hooks/usePrinters';
import { useWithdrawAll } from '@/components/features/vault/hooks/useWithdrawAll';
import type { WindowName } from '@/types';
import { AtelierDetailModal } from '@/components/features/vault/components/AtelierDetailModal';
import { SculptDetailModal } from '@/components/features/vault/components/SculptDetailModal';
import { formatSuiAmount } from '@/utils/formatters';
import { RetroButton } from '@/components/common/RetroButton';
import { RetroTabsList, RetroTabsTrigger } from '@/components/common/RetroTabs';
import { RetroPanel } from '@/components/common/RetroPanel';
import { RetroEmptyState } from '@/components/common/RetroEmptyState';
import { RetroListItem, RetroListThumbnail, RetroListInfo, RetroListArrow } from '@/components/common/RetroListItem';
import { RetroPrinterCard } from '@/components/common/RetroPrinterCard';

interface VaultWindowProps {
  name: WindowName;
}


const ImageItem: React.FC<{
  atelier: VaultItem;
  onClick: () => void;
}> = ({ atelier, onClick }) => {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '100px' });
  const [loaded, setLoaded] = useState(false);

  if (atelier.isLoading) {
    return <div className="w-full aspect-square bg-neutral-800/50 rounded-sm" />;
  }

  if (atelier.error) {
    return (
      <div className="w-full aspect-square bg-red-900/20 flex items-center justify-center rounded-sm">
        <p className="text-red-500 text-sm">{atelier.error}</p>
      </div>
    );
  }

  return (
    <div
      className="relative group w-full outline-none transition-all cursor-pointer"
      onClick={onClick}
      ref={ref}
      tabIndex={0}
      role="button"
    >
      <div className="relative w-full">
        <div className="absolute inset-0 bg-neutral-800/50 rounded-sm z-0" />
        {inView && (
          <Image
            src={`/api/image-proxy?blobId=${atelier.photoBlobId}`}
            alt={
              atelier.type === 'atelier'
                ? (atelier as AtelierItem).title || 'Atelier item'
                : (atelier as SculptItem).alias || 'Sculpt item'
            }
            width={1200}
            height={800}
            quality={90}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/2wCEAAEBAQEBAQEBAQEBAQECAgICAgICAgICAgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAALCAA4ADgBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z"
            onLoad={() => setLoaded(true)}
            className={`w-full h-auto object-cover rounded-sm shadow-md opacity-0 transition-opacity duration-500 group-hover:scale-[1.02] ${
              loaded ? 'opacity-100' : ''
            }`}
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1400px) 33vw, 25vw"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end">
          <div className="bg-black/40 backdrop-blur-sm px-3 py-2">
            <div className="flex flex-col text-xs text-white/90">
              {atelier.type === 'atelier' ? (
                <>
                  <span className="font-semibold">{(atelier as AtelierItem).title}</span>
                  <span>Fee Pool: {formatSuiAmount((atelier as AtelierItem).pool)}</span>
                  <span>Published: {(atelier as AtelierItem).publish_time}</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">{(atelier as SculptItem).alias}</span>
                  <span>
                    Artist:{' '}
                    {atelier.type === 'sculpt' && (atelier as SculptItem).creator
                      ? `${(atelier as SculptItem).creator.substring(0, 4)}...${(atelier as SculptItem).creator.slice(-4)}`
                      : 'Unknown'}
                  </span>
                  <span>Created: {(atelier as SculptItem).time}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VaultWindow({}: VaultWindowProps) {
  const [activeTab, setActiveTab] = useState<'ateliers' | 'sculpts'>('ateliers');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [showPrinters, setShowPrinters] = useState<boolean>(false);
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [withdrawMessage, setWithdrawMessage] = useState<string>('');
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [selectedAtelier, setSelectedAtelier] = useState<AtelierItem | null>(null);
  const [selectedSculpt, setSelectedSculpt] = useState<SculptItem | null>(null);
  
  // Adding timeout handler reference
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    items: ateliers,
    isLoading: isLoadingAteliers,
    error: errorAteliers,
    reload: reloadAteliers,
  } = useUserItems('ateliers');

  const {
    items: sculpts,
    isLoading: isLoadingSculpts,
    error: errorSculpts,
    reload: reloadSculpts,
  } = useUserItems('sculptures');

  const {
    printers,
    isLoading: isLoadingPrinters,
    error: errorPrinters,
    reload: reloadPrinters,
  } = usePrinters();

  const {
    withdrawAll,
    status: withdrawAllStatus,
    error: withdrawAllError,
    txDigest: withdrawAllTxDigest,
    totalWithdrawn,
    resetStatus: resetWithdrawAll,
  } = useWithdrawAll();

  // Selected printer data
  const selectedPrinterData = selectedPrinter 
    ? printers.find(p => p.id === selectedPrinter) 
    : null;

  useEffect(() => {
    console.log('🔁 Active tab changed:', activeTab);
    if (activeTab === 'sculpts') {
      console.log('🟢 Tab switched to My Sculpts');
      reloadPrinters();
    }
  }, [activeTab]);

  const breakpointColumns = { default: 4, 1400: 3, 1100: 2, 700: 1 };

  const handlePrinterSelect = (printerId: string) => {
    setSelectedPrinter(printerId);
  };

  const handleWithdrawStatusChange = (status: 'idle' | 'processing' | 'success' | 'error', message?: string, digest?: string) => {
    // Clear previous timer (if exists)
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }
    
    // Force UI update by using setTimeout
    setTimeout(() => {
      setWithdrawStatus(status);
      
      // Ensure we always have a message
      let displayMessage = message || '';
      if (!displayMessage) {
        if (status === 'processing') displayMessage = 'Processing transaction...';
        else if (status === 'success') displayMessage = 'Transaction successful!';
        else if (status === 'error') displayMessage = 'Transaction failed';
      }
      
      // Check for rejection messages
      if (status === 'error' && displayMessage.toLowerCase().includes('cancelled')) {
        displayMessage = 'Transaction cancelled by user';
      }
      
      setWithdrawMessage(displayMessage);
      
      if (digest) {
        setTxDigest(digest);
      } else if (status === 'idle') {
        setTxDigest(null);
      }
      
      // If status is processing, set 30 second timeout
      if (status === 'processing') {
        processingTimerRef.current = setTimeout(() => {
          setWithdrawStatus('error');
          setWithdrawMessage('Transaction timed out. Please try again later.');
          processingTimerRef.current = null;
        }, 30000); // 30 second timeout
      }
    }, 0);
  };

  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-full overflow-hidden">
      <Tabs.Root
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'ateliers' | 'sculpts')}
        className="flex flex-col h-full bg-[#1a1a1a]"
      >
        {/* Header with Tabs and View Mode Toggle */}
        <div 
          className="flex items-center justify-between bg-[#0f0f0f] px-2"
          style={{
            borderBottom: '2px solid #0a0a0a',
            boxShadow: 'inset 0 -1px 2px rgba(0, 0, 0, 0.5)',
          }}
        >
          <RetroTabsList className="flex-1">
            <RetroTabsTrigger value="ateliers">
              Ateliers
            </RetroTabsTrigger>
            <RetroTabsTrigger value="sculpts">
              Sculpts
            </RetroTabsTrigger>
          </RetroTabsList>

          {/* View Mode Toggle */}
          <div className="flex gap-1 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white/10 text-white/90'
                  : 'text-white/40 hover:text-white/70'
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white/10 text-white/90'
                  : 'text-white/40 hover:text-white/70'
              }`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <Tabs.Content value="ateliers" className="flex-1 overflow-y-auto bg-[#1a1a1a]">
          <div className="p-4 space-y-4">
            {/* Withdraw All Button */}
            {ateliers.length > 0 && ateliers.some(a => Number((a as AtelierItem).pool) > 0) && (
              <RetroPanel className="flex items-center justify-between p-3">
                <div>
                  <p className="text-white/90 text-xs font-medium tracking-wide">WITHDRAW ALL EARNINGS</p>
                  <p className="text-white/40 text-[10px] mt-1 font-mono">
                    Batch withdraw from all ateliers with balance
                  </p>
                </div>
                <RetroButton
                  variant="primary"
                  size="md"
                  onClick={() => withdrawAll(ateliers as AtelierItem[])}
                  isLoading={withdrawAllStatus === 'processing'}
                >
                  {withdrawAllStatus === 'processing' ? 'Processing...' : 'Withdraw All'}
                </RetroButton>
              </RetroPanel>
            )}

            {/* Items Container */}
            <div className="relative">
              {isLoadingAteliers && !ateliers.length ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : errorAteliers ? (
              <RetroEmptyState 
                title={errorAteliers.includes('wallet') ? 'WALLET NOT CONNECTED' : 'NO MEMBERSHIP NFT'}
                message={errorAteliers}
                icon={errorAteliers.includes('wallet') ? 'globe' : 'file'}
              />
            ) : !ateliers.length ? (
              <RetroEmptyState 
                title="NO ATELIERS FOUND"
                message="Create your first Atelier to get started!"
                icon="box"
              />
            ) : viewMode === 'grid' ? (
              <Masonry
                breakpointCols={breakpointColumns}
                className="flex w-auto -ml-3"
                columnClassName="pl-3 bg-clip-padding"
              >
                {ateliers.map((atelier) => (
                  <div key={atelier.id} className="mb-3">
                    <ImageItem
                      atelier={atelier}
                      onClick={() => setSelectedAtelier(atelier as AtelierItem)}
                    />
                  </div>
                ))}
              </Masonry>
            ) : (
              /* List View */
              <div className="space-y-2">
                {ateliers.map((atelier) => {
                  const item = atelier as AtelierItem;
                  return (
                    <RetroListItem
                      key={item.id}
                      onClick={() => setSelectedAtelier(item)}
                    >
                      <RetroListThumbnail
                        src={`/api/image-proxy?blobId=${item.photoBlobId}`}
                        alt={item.title}
                      />
                      <RetroListInfo
                        title={item.title}
                        metadata={
                          <>
                            <span>POOL: {formatSuiAmount(item.pool)}</span>
                            <span>PRICE: {formatSuiAmount(item.price)}</span>
                            <span>{item.publish_time}</span>
                          </>
                        }
                      />
                      <RetroListArrow />
                    </RetroListItem>
                  );
                })}
              </div>
            )}
            </div>
          </div>
        </Tabs.Content>

      <Tabs.Content value="sculpts" className="flex-1 overflow-y-auto bg-[#1a1a1a]">
        <div className="p-4 space-y-4">
          {/* Printer selection area */}
          <RetroPanel className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                {selectedPrinter ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-medium text-white/90">
                      PRINTER: {selectedPrinterData?.alias || `${selectedPrinter.substring(0, 6)}...${selectedPrinter.slice(-6)}`}
                    </span>
                    <button
                      onClick={() => {
                        setShowPrinters(!showPrinters);
                        if (!showPrinters) setSelectedPrinter(null);
                      }}
                      className="text-[10px] text-white/40 hover:text-white/80 underline font-mono"
                    >
                      {showPrinters ? "CANCEL" : "CHANGE"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-white/40 font-mono">Select a printer to print your sculpture</span>
                  )}
                </div>

                {!selectedPrinter && (
                  <RetroButton
                    variant="primary"
                    size="sm"
                    onClick={() => setShowPrinters(!showPrinters)}
                  >
                    {showPrinters ? 'Cancel' : 'Select Printer'}
                  </RetroButton>
                )}
            </div>
            
            {showPrinters && (
              <div className="mt-3">
                {isLoadingPrinters ? (
                  <div className="p-4 text-center">
                    <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">Loading printers...</p>
                  </div>
                ) : errorPrinters ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-red-400">{errorPrinters}</p>
                    <button 
                      onClick={reloadPrinters}
                      className="mt-2 text-xs text-neutral-400 hover:text-white underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : printers.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-neutral-400">No printers available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {printers.map(printer => (
                      <RetroPrinterCard
                        key={printer.id}
                        printer={printer}
                        onSelect={() => {
                          if (printer.online) {
                            handlePrinterSelect(printer.id);
                            setShowPrinters(false);
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </RetroPanel>
          
          {/* Sculpture display area */}
          <div className="relative">
            {isLoadingSculpts && !sculpts.length ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : errorSculpts ? (
            <RetroEmptyState 
              title={errorSculpts.includes('wallet') ? 'WALLET NOT CONNECTED' : 'NO MEMBERSHIP NFT'}
              message={errorSculpts}
              icon={errorSculpts.includes('wallet') ? 'globe' : 'file'}
            />
          ) : !sculpts.length ? (
            <RetroEmptyState 
              title="NO SCULPTS FOUND"
              message="Create your first Sculpt to get started!"
              icon="file"
            />
            ) : viewMode === 'grid' ? (
              <Masonry
                breakpointCols={breakpointColumns}
                className="flex w-auto -ml-3"
                columnClassName="pl-3 bg-clip-padding"
              >
                {sculpts.map((sculpt) => (
                  <div key={sculpt.id} className="mb-3">
                    <ImageItem
                      atelier={sculpt}
                      onClick={() => setSelectedSculpt(sculpt as SculptItem)}
                    />
                  </div>
                ))}
              </Masonry>
            ) : (
              /* List View */
              <div className="space-y-2">
                {sculpts.map((sculpt) => {
                  const item = sculpt as SculptItem;
                  return (
                    <RetroListItem
                      key={item.id}
                      onClick={() => setSelectedSculpt(item)}
                    >
                      <RetroListThumbnail
                        src={`/api/image-proxy?blobId=${item.photoBlobId}`}
                        alt={item.alias}
                      />
                      <RetroListInfo
                        title={item.alias}
                        metadata={
                          <>
                            <span>CREATOR: {item.creator.substring(0, 6)}...{item.creator.slice(-4)}</span>
                            <span>{item.time}</span>
                          </>
                        }
                      />
                      <RetroListArrow />
                    </RetroListItem>
                  );
                })}
              </div>
            )}

            {!selectedPrinter && sculpts.length > 0 && !showPrinters && (
              <div className="fixed bottom-4 right-4 bg-neutral-900/90 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm max-w-xs border border-neutral-800">
                <div className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <button
                    onClick={() => setShowPrinters(true)}
                    className="text-xs hover:underline"
                  >
                  Select a printer to print your sculptures
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Transaction status notification */}
      {withdrawStatus !== 'idle' && (
        <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex flex-col gap-2">
            {/* Processing */}
            {withdrawStatus === 'processing' && (
              <div className="flex items-center gap-3">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
                  <div className="absolute inset-0 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                </div>
                <span className="text-white/90 text-sm font-mono tracking-wider">{withdrawMessage || 'Processing...'}</span>
              </div>
            )}
            {/* Success */}
            {withdrawStatus === 'success' && (
              <div className="flex items-center gap-3">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 border-2 border-green-500/50 rounded-full" />
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-white/90 text-sm font-mono tracking-wider">{withdrawMessage}</span>
                  {txDigest && (
                    <a
                      href={`https://suiexplorer.com/txblock/${txDigest}?network=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/50 hover:text-white/80 transition-colors underline underline-offset-2"
                    >
                      View Transaction
                    </a>
                  )}
                </div>
              </div>
            )}
            {/* Fail */}
            {withdrawStatus === 'error' && (
              <div className="flex items-center gap-3">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 border-2 border-red-500/50 rounded-full" />
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-white/90 text-sm font-mono tracking-wider">{withdrawMessage || 'Transaction failed'}</span>
                  {/* Add close button */}
                  <button 
                    onClick={() => handleWithdrawStatusChange('idle')}
                    className="text-xs text-white/50 hover:text-white/80 transition-colors underline self-start mt-1"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedAtelier && (
        <AtelierDetailModal
          atelier={selectedAtelier}
          isOpen={true}
          onClose={() => setSelectedAtelier(null)}
          onUpdate={() => {
            reloadAteliers();
          }}
        />
      )}

      {selectedSculpt && (
        <SculptDetailModal
          sculpt={selectedSculpt}
          isOpen={true}
          onClose={() => setSelectedSculpt(null)}
          onUpdate={() => {
            reloadSculpts();
          }}
          selectedPrinter={selectedPrinter || undefined}
        />
      )}
    </div>
  );
}