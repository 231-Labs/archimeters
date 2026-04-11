import { useState, useEffect, useRef } from 'react';
import { useCurrentClient } from '@mysten/dapp-kit-react';
import { KioskClient } from '@mysten/kiosk';
import { getSuiJsonRpcClientForEvents } from '@/lib/sui-jsonrpc-events';

interface ListedStatus {
  isListed: boolean;
  price: string | null;
  kioskId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useSculptListedStatus(
  sculptId: string | null, 
  refreshKey: number = 0,
  kioskId: string | null = null
): ListedStatus {
  const suiClient = useCurrentClient();
  const [status, setStatus] = useState<ListedStatus>({
    isListed: false,
    price: null,
    kioskId: null,
    isLoading: true,
    error: null,
  });
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isQueryingRef = useRef(false);
  const lastQueryResultRef = useRef<{isListed: boolean; price: string | null; kioskId: string | null} | null>(null);
  const MAX_RETRIES = 2;

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!sculptId) {
      setStatus({
        isListed: false,
        price: null,
        kioskId: null,
        isLoading: false,
        error: null,
      });
      lastQueryResultRef.current = null;
      isQueryingRef.current = false;
      return;
    }

    if (isQueryingRef.current) {
      return;
    }

    retryCountRef.current = 0;

    const checkListedStatus = async () => {
      if (isQueryingRef.current) return;
      
      isQueryingRef.current = true;
      
      try {
        setStatus(prev => ({ ...prev, isLoading: true, error: null }));

        const kioskClient = new KioskClient({
          client: suiClient as never,
          network: 'testnet',
        });

        if (kioskId) {
          try {
            const kioskData = await kioskClient.getKiosk({
              id: kioskId,
              options: {
                withKioskFields: true,
                withListingPrices: true,
              }
            });

            const item = kioskData.items.find(i => i.objectId === sculptId);
            
            if (item && item.listing && item.listing.isExclusive === false) {
              const price = item.listing.price || '0';
              const result = {
                isListed: true,
                price: price.toString(),
                kioskId: kioskId,
              };
              lastQueryResultRef.current = result;
              setStatus({
                ...result,
                isLoading: false,
                error: null,
              });
              retryCountRef.current = 0;
              isQueryingRef.current = false;
              return;
            }
          } catch (kioskErr) {
            console.error('Error querying kiosk with KioskClient:', kioskErr);
          }
        }

        try {
          const { object: sculptRow } = await suiClient.getObject({
            objectId: sculptId,
          });

          const owner = sculptRow.owner;
          if (owner?.$kind === 'ObjectOwner') {
            const ownerKioskId = owner.ObjectOwner;
            
            try {
              const kioskData = await kioskClient.getKiosk({
                id: ownerKioskId,
                options: {
                  withKioskFields: true,
                  withListingPrices: true,
                }
              });

              const item = kioskData.items.find(i => i.objectId === sculptId);
              
              if (item && item.listing && item.listing.isExclusive === false) {
                const price = item.listing.price || '0';
                const result = {
                  isListed: true,
                  price: price.toString(),
                  kioskId: ownerKioskId,
                };
                lastQueryResultRef.current = result;
                setStatus({
                  ...result,
                  isLoading: false,
                  error: null,
                });
                retryCountRef.current = 0;
                isQueryingRef.current = false;
                return;
              }
            } catch (ownerKioskErr) {
              console.error('Error querying owner kiosk:', ownerKioskErr);
            }
          }
        } catch (sculptErr) {
          console.error('Error checking sculpt owner:', sculptErr);
        }

        const eventsClient = getSuiJsonRpcClientForEvents('testnet');

        const listedEvents = await eventsClient.queryEvents({
          query: {
            MoveEventType: '0x2::kiosk::ItemListed',
          },
          limit: 200,
          order: 'descending',
        });

        const delistedEvents = await eventsClient.queryEvents({
          query: {
            MoveEventType: '0x2::kiosk::ItemDelisted',
          },
          limit: 200,
          order: 'descending',
        });

        let latestListedEvent: any = null;
        let latestListedTimestamp = 0;
        
        for (const eventData of listedEvents.data) {
          const event = eventData.parsedJson as any;
          const eventItemId = event?.id || event?.item_id || event?.itemId;
          
          if (event && eventItemId === sculptId) {
            const timestamp = Number(eventData.timestampMs || '0');
            if (timestamp > latestListedTimestamp) {
              latestListedTimestamp = timestamp;
              latestListedEvent = event;
            }
          }
        }

        if (latestListedEvent) {
          let wasDelisted = false;
          for (const eventData of delistedEvents.data) {
            const event = eventData.parsedJson as any;
            const eventItemId = event?.id || event?.item_id || event?.itemId;
            
            if (event && eventItemId === sculptId) {
              const delistedTimestamp = Number(eventData.timestampMs || '0');
              if (delistedTimestamp > latestListedTimestamp) {
                wasDelisted = true;
                break;
              }
            }
          }

          if (!wasDelisted) {
            const price = latestListedEvent.price || latestListedEvent.list_price || '0';
            const result = {
              isListed: true,
              price: price.toString(),
              kioskId: latestListedEvent.kiosk || latestListedEvent.kiosk_id || kioskId || null,
            };
            lastQueryResultRef.current = result;
            setStatus({
              ...result,
              isLoading: false,
              error: null,
            });
            retryCountRef.current = 0;
            isQueryingRef.current = false;
            return;
          }
        }

        const result = {
          isListed: false,
          price: null,
          kioskId: null,
        };
        lastQueryResultRef.current = result;
        setStatus({
          ...result,
          isLoading: false,
          error: null,
        });
        retryCountRef.current = 0;
        isQueryingRef.current = false;
      } catch (err) {
        console.error('Error checking listed status:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to check listed status';
        
        const isNetworkError = errorMessage.includes('Failed to fetch') || 
                              errorMessage.includes('CORS') ||
                              errorMessage.includes('network');
        
        if (isNetworkError && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1;
          timeoutRef.current = setTimeout(() => {
            checkListedStatus();
          }, 2000 * retryCountRef.current);
        } else {
          setStatus({
            isListed: false,
            price: null,
            kioskId: null,
            isLoading: false,
            error: isNetworkError && retryCountRef.current >= MAX_RETRIES 
              ? 'Network error: Unable to check listing status. Please refresh the page.'
              : errorMessage,
          });
          retryCountRef.current = 0;
          isQueryingRef.current = false;
        }
      }
    };

    checkListedStatus();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      isQueryingRef.current = false;
    };
  }, [sculptId, refreshKey, kioskId]);

  return status;
}
