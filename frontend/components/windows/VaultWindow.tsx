'use client';

import * as Tabs from '@radix-ui/react-tabs';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect, useRef } from 'react';
import { useUserItems, VaultItem, AtelierItem, SculptItem } from '@/components/features/vault/hooks/useUserItems';
import { usePrinters, Printer } from '@/components/features/vault/hooks/usePrinters';
import type { WindowName } from '@/types';
import { AtelierWithdrawButton } from '@/components/features/vault/components/AtelierWithdrawButton';
import { SculptPrintButton } from '@/components/features/vault/components/SculptPrintButton';

const SUI_MIST = 1000000000;

interface VaultWindowProps {
  name: WindowName;
}

// printer component
const PrinterCard: React.FC<{ printer: Printer, onSelect: () => void }> = ({ printer, onSelect }) => {
  return (
    <div 
      onClick={printer.online ? onSelect : undefined}
      className={`p-3 border border-neutral-700 rounded-md transition-colors flex flex-col w-full h-full shadow-sm ${
        printer.online 
          ? 'bg-neutral-800 hover:bg-neutral-700 cursor-pointer' 
          : 'bg-neutral-900/80 opacity-70 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${printer.online ? 'bg-green-500' : 'bg-neutral-500'}`} />
          <div className="text-sm font-medium truncate">{printer.alias || 'Unknown Printer'}</div>
        </div>
        <div className={`text-xs px-1.5 py-0.5 rounded ${
          printer.online 
            ? 'bg-green-900/30 text-green-400' 
            : 'bg-neutral-800/70 text-neutral-500'
        }`}>
          {printer.online ? 'Online' : 'Offline'}
        </div>
      </div>
      <div className="text-xs text-neutral-500 truncate mt-1">ID: {printer.id.substring(0, 6)}...{printer.id.slice(-6)}</div>
    </div>
  );
};

const ImageItem: React.FC<{
  atelier: VaultItem;
  reload: () => void;
  selectedPrinter?: string | null;
  onWithdrawStatusChange: (status: 'idle' | 'processing' | 'success' | 'error', message?: string, txDigest?: string) => void;
}> = ({ atelier, reload, selectedPrinter, onWithdrawStatusChange }) => {
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
      className="relative group w-full outline-none transition-all"
      onClick={() => console.log('handleImageClick atelier: ', atelier)}
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
        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {atelier.type === 'atelier' ? (
            <AtelierWithdrawButton
              atelierId={atelier.id}
              poolAmount={Number((atelier as AtelierItem).pool)}
              onSuccess={() => {
                onWithdrawStatusChange('success', 'Withdrawal successful');
                setTimeout(() => {
                  reload();
                  onWithdrawStatusChange('idle');
                }, 2000);
              }}
              onError={(error) => {
                onWithdrawStatusChange('error', `Withdrawal failed: ${error}`);
                setTimeout(() => {
                  onWithdrawStatusChange('idle');
                }, 5000);
              }}
              onStatusChange={(status, message) => onWithdrawStatusChange(status, message)}
            />
          ) : (
            <SculptPrintButton
              sculptId={atelier.id}
              printerId={selectedPrinter || undefined}
              onSuccess={() => {
                setTimeout(() => {
                  reload();
                  onWithdrawStatusChange('idle');
                }, 5000);
              }}
              onError={(error) => {
                onWithdrawStatusChange('error', `Print failed: ${error}`);
                setTimeout(() => {
                  onWithdrawStatusChange('idle');
                }, 5000);
              }}
              onStatusChange={(status, message, txDigest) => onWithdrawStatusChange(status, message, txDigest)}
            />
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end">
          <div className="bg-black/40 backdrop-blur-sm px-3 py-2">
            <div className="flex flex-col text-xs text-white/90">
              {atelier.type === 'atelier' ? (
                <>
                  <span className="font-semibold">{(atelier as AtelierItem).title}</span>
                  <span>Fee Pool: {Number((atelier as AtelierItem).pool) / SUI_MIST} SUI</span>
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
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [showPrinters, setShowPrinters] = useState<boolean>(false);
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [withdrawMessage, setWithdrawMessage] = useState<string>('');
  const [txDigest, setTxDigest] = useState<string | null>(null);
  
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
    <>
      <Tabs.Root
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'ateliers' | 'sculpts')}
        className="flex flex-col h-full bg-[#1a1a1a]"
      >
        <Tabs.List className="flex space-x-4 border-b border-neutral-700 p-2 bg-[#1a1a1a]">
          <Tabs.Trigger
            value="ateliers"
            className="text-white px-4 py-2 rounded hover:bg-neutral-800 data-[state=active]:bg-neutral-700"
          >
          My Ateliers
          </Tabs.Trigger>
          <Tabs.Trigger
            value="sculpts"
            className="text-white px-4 py-2 rounded hover:bg-neutral-800 data-[state=active]:bg-neutral-700"
          >
          My Sculpts
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="ateliers" className="flex-1 overflow-y-auto bg-[#1a1a1a]">
          <div className="p-4">
            {isLoadingAteliers && !ateliers.length ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : errorAteliers ? (
              <div className="flex flex-col items-center justify-center h-full text-white/80">
                <p className="text-lg mb-2">{errorAteliers}</p>
              </div>
            ) : !ateliers.length ? (
              <div className="flex flex-col items-center justify-center h-full text-white/80">
                <p className="text-lg mb-2">No Atelier Found</p>
                <p className="text-sm">Create your first Atelier to get started!</p>
              </div>
            ) : (
              <Masonry
                breakpointCols={breakpointColumns}
                className="flex w-auto -ml-3"
                columnClassName="pl-3 bg-clip-padding"
              >
                {ateliers.map((atelier) => (
                  <div key={atelier.id} className="mb-3">
                    <ImageItem
                      atelier={atelier}
                      reload={reloadAteliers}
                      selectedPrinter={selectedPrinter}
                      onWithdrawStatusChange={handleWithdrawStatusChange}
                    />
                  </div>
                ))}
              </Masonry>
            )}
          </div>
        </Tabs.Content>

      <Tabs.Content value="sculpts" className="flex-1 overflow-y-auto bg-[#1a1a1a]">
        <div className="p-4">
          {/* Printer selection area */}
          <div className="mb-4 bg-neutral-900/80 rounded-lg p-3 border border-neutral-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                {selectedPrinter ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">
                      Printer: {selectedPrinterData?.alias || `${selectedPrinter.substring(0, 6)}...${selectedPrinter.slice(-6)}`}
                    </span>
                    <button
                      onClick={() => {
                        setShowPrinters(!showPrinters);
                        if (!showPrinters) setSelectedPrinter(null);
                      }}
                      className="text-xs text-neutral-400 hover:text-white underline"
                    >
                      {showPrinters ? "Cancel" : "Change"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-400">Select a printer to print your sculpture</span>
                  )}
                </div>

                {!selectedPrinter && (
                  <button
                    onClick={() => setShowPrinters(!showPrinters)}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs rounded border border-neutral-700"
                  >
                  {showPrinters ? 'Cancel' : 'Select Printer'}
                </button>
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
                      <PrinterCard
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
          </div>
          
          {/* Sculpture display area */}
          {isLoadingSculpts && !sculpts.length ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : errorSculpts ? (
            <div className="flex flex-col items-center justify-center h-full text-white/80">
              <p className="text-lg mb-2">{errorSculpts}</p>
            </div>
          ) : !sculpts.length ? (
            <div className="flex flex-col items-center justify-center h-full text-white/80">
              <p className="text-lg mb-2">No Sculpts Found</p>
              <p className="text-sm">Create your first Sculpt to get started!</p>
              </div>
            ) : (
              <Masonry
                breakpointCols={breakpointColumns}
                className="flex w-auto -ml-3"
                columnClassName="pl-3 bg-clip-padding"
              >
                {sculpts.map((sculpt) => (
                  <div key={sculpt.id} className="mb-3">
                    <ImageItem
                      atelier={sculpt}
                      reload={reloadSculpts}
                      selectedPrinter={selectedPrinter}
                      onWithdrawStatusChange={handleWithdrawStatusChange}
                    />
                  </div>
                ))}
              </Masonry>
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
    </>
  );
}