'use client';

import * as Tabs from '@radix-ui/react-tabs';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { useUserItems, VaultItem, AtelierItem, SculptItem } from '@/components/features/vault/hooks/useUserItems';
import type { WindowName } from '@/types';
import { AtelierWithdrawButton } from '@/components/features/vault/components/AtelierWithdrawButton';
import { SculptPrintButton } from '@/components/features/vault/components/SculptPrintButton';

const SUI_MIST = 1000000000;

// add mock printers
const MOCK_PRINTERS = [
  { id: 'printer-1', name: 'Printer 1', status: 'available', location: 'New York Studio' },
  { id: 'printer-2', name: 'Printer 2', status: 'available', location: 'Tokyo Studio' },
  { id: 'printer-3', name: 'Printer 3', status: 'busy', location: 'London Studio' },
  { id: 'printer-4', name: 'Printer 4', status: 'available', location: 'San Francisco Studio' },
];

interface VaultWindowProps {
  name: WindowName;
}

// printer component
const PrinterCard: React.FC<{ printer: typeof MOCK_PRINTERS[0], onSelect: () => void }> = ({ printer, onSelect }) => {
  return (
    <div 
      onClick={printer.status === 'available' ? onSelect : undefined}
      className={`relative p-2 rounded-md border border-neutral-700 transition-all ${
        printer.status === 'available' 
          ? 'bg-neutral-800/50 hover:bg-neutral-700/50 cursor-pointer' 
          : 'bg-neutral-900/50 opacity-60 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${printer.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`} />
          <div className="text-sm">{printer.name}</div>
        </div>
        <div className="text-xs text-neutral-500">{printer.location}</div>
      </div>
    </div>
  );
};

const ImageItem: React.FC<{
  atelier: VaultItem;
  reload: () => void;
  selectedPrinter?: string | null;
  onWithdrawStatusChange: (status: 'idle' | 'processing' | 'success' | 'error', message?: string) => void;
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
            blurDataURL="data:image/jpeg;base64,/9j/2wCEAAEBAQEBAQEBAQEBAQECAgICAgICAgICAgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAALCAA4ADgBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z"
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
                onWithdrawStatusChange('success', 'Print success');
                setTimeout(() => {
                  reload();
                  onWithdrawStatusChange('idle');
                }, 2000);
              }}
              onError={(error) => {
                onWithdrawStatusChange('error', `Print failed:${error}`);
                setTimeout(() => {
                  onWithdrawStatusChange('idle');
                }, 5000);
              }}
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

  useEffect(() => {
    console.log('🔁 Active tab changed:', activeTab);
    if (activeTab === 'sculpts') console.log('🟢 Tab switched to My Sculpts');
  }, [activeTab]);

  const breakpointColumns = { default: 4, 1400: 3, 1100: 2, 700: 1 };

  const handlePrinterSelect = (printerId: string) => {
    setSelectedPrinter(printerId);
  };

  const handleWithdrawStatusChange = (status: 'idle' | 'processing' | 'success' | 'error', message?: string) => {
    setWithdrawStatus(status);
    setWithdrawMessage(message || '');
  };

  return (
    <>
      <Tabs.Root
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'ateliers' | 'sculpts')}
        className="flex flex-col h-full"
      >
        <Tabs.List className="flex space-x-4 border-b border-neutral-700 p-2">
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

        <Tabs.Content value="ateliers" className="flex-1 overflow-y-auto">
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

        <Tabs.Content value="sculpts" className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Printer selection area */}
            <div className="mb-4 bg-neutral-900/80 rounded-lg p-3 border border-neutral-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  {selectedPrinter ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">
                        Printer: {MOCK_PRINTERS.find(p => p.id === selectedPrinter)?.name} (
                        {MOCK_PRINTERS.find(p => p.id === selectedPrinter)?.location})
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
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {MOCK_PRINTERS.map(printer => (
                    <PrinterCard
                      key={printer.id}
                      printer={printer}
                      onSelect={() => {
                        handlePrinterSelect(printer.id);
                        setShowPrinters(false);
                      }}
                    />
                  ))}
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

      {/* 提現狀態通知 */}
      {withdrawStatus !== 'idle' && (
        <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg">
          <div className="flex flex-col gap-2">
            {/* 處理中 */}
            {withdrawStatus === 'processing' && (
              <div className="flex items-center gap-3">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
                  <div className="absolute inset-0 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                </div>
                <span className="text-white/90 text-sm font-mono tracking-wider">processing...</span>
              </div>
            )}
            {/* 成功 */}
            {withdrawStatus === 'success' && (
              <div className="flex items-center gap-3">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 border-2 border-green-500/50 rounded-full" />
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/90 text-sm font-mono tracking-wider">{withdrawMessage}</span>
              </div>
            )}
            {/* 失敗 */}
            {withdrawStatus === 'error' && (
              <div className="flex items-center gap-3">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 border-2 border-red-500/50 rounded-full" />
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-white/90 text-sm font-mono tracking-wider">{withdrawMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}