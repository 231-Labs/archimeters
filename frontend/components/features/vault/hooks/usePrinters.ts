import { useCurrentClient } from '@mysten/dapp-kit-react';
import { useState, useEffect } from 'react';
import { PRINTER_REGISTRY } from '@/utils/transactions';
import { moveObjectFields } from '@/lib/sui-object-json';

export interface Printer {
  id: string;
  alias: string;
  online: boolean;
  owner: string;
}

// Extract ID string, remove quotes
function extractId(id: string): string {
  return id.replace(/^["'](.+)["']$/, '$1').replace(/^`(.+)`$/, '$1');
}

export function usePrinters() {
  const suiClient = useCurrentClient();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  useEffect(() => {
    const fetchPrinters = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if PRINTER_REGISTRY is valid
        if (!PRINTER_REGISTRY) {
          console.error('PRINTER_REGISTRY is undefined');
          throw new Error('Printer registry address is undefined');
        }
        
        // Extract the actual ID
        const registryId = extractId(PRINTER_REGISTRY);
        
        if (registryId.length < 30) {
          console.error('Invalid PRINTER_REGISTRY value after extraction:', registryId);
          throw new Error('Invalid printer registry address');
        }

        // Get the printer registry object
        const { object: registryRow } = await suiClient.getObject({
          objectId: registryId,
          include: { json: true },
        });

        if (!registryRow) {
          console.error('Registry object not found:', registryId);
          throw new Error(`Printer registry not found: ${registryId}`);
        }

        const fields = moveObjectFields(registryRow.json);
        if (!fields) {
          console.error('Invalid registry content format');
          throw new Error('Registry content format is invalid');
        }
        
        const printerData = fields.printers as any;

        let printerIds: string[] = [];

        if (printerData && typeof printerData === 'object' && 'fields' in printerData && 'contents' in printerData.fields) {
          printerIds = printerData.fields.contents || [];
        } else if (Array.isArray(printerData)) {
          printerIds = printerData;
        } else if (printerData && typeof printerData === 'object' && 'fields' in printerData && 'items' in printerData.fields) {
          const items = printerData.fields.items;
          if (Array.isArray(items)) {
            printerIds = items.map((item: { id?: string } | string) => {
              if (typeof item === 'object' && item && 'id' in item && item.id) {
                return item.id;
              }
              return item as string;
            }).filter(Boolean);
          }
        } else if (typeof printerData === 'string' && printerData.startsWith('0x')) {
          printerIds = [printerData];
        } else if (printerData && typeof printerData === 'object') {
          const findIds = (obj: unknown): string[] => {
            if (!obj) return [];
            if (typeof obj === 'string' && obj.startsWith('0x') && obj.length >= 30) {
              return [obj];
            }
            if (Array.isArray(obj)) {
              return obj.flatMap(findIds);
            }
            if (typeof obj === 'object') {
              return Object.values(obj).flatMap(findIds);
            }
            return [];
          };

          printerIds = findIds(printerData);
        }
        
        if (printerIds.length === 0) {
          setPrinters([]);
          setIsLoading(false);
          return;
        }

        // Get detailed information for all printer objects
        const { objects: printersData } = await suiClient.getObjects({
          objectIds: printerIds,
          include: { json: true },
        });

        const parsedPrinters: Printer[] = printersData.flatMap((obj) => {
            if (obj instanceof Error) return [];
            const fields = moveObjectFields(obj.json);
            if (!fields) {
              console.error('Invalid printer data format');
              return [];
            }

            try {
              let id: string;
              if (obj.objectId) {
                id = obj.objectId;
              } else if (fields.id) {
                if (typeof fields.id === 'string') {
                  // Direct string ID
                  id = fields.id;
                } else if (typeof fields.id === 'object' && fields.id !== null) {
                  if ('id' in fields.id && typeof fields.id.id === 'string') {
                    // Nested ID object {id: 'xxx'}
                    id = fields.id.id;
                  } else {
                    // Try to extract ID from object
                    const possibleId = Object.values(fields.id).find(
                      (val): val is string => typeof val === 'string' && val.startsWith('0x')
                    );
                    id = possibleId || `unknown-${Math.random().toString(36).substring(2, 10)}`;
                  }
                } else {
                  // Unable to parse ID, use random ID
                  id = `unknown-${Math.random().toString(36).substring(2, 10)}`;
                }
              } else {
                // ID not found, use random ID
                id = `unknown-${Math.random().toString(36).substring(2, 10)}`;
              }
              
              // Try to find fields related to alias and online status
              let alias: string;
              if (typeof fields.alias === 'string') {
                alias = fields.alias;
              } else if (typeof fields.name === 'string') {
                alias = fields.name;
              } else {
                alias = `Printer ${id.substring(0, 8)}`;
              }
              
              // Try various possible online status fields
              const online = fields.online === true || 
                             fields.online === 'true' || 
                             fields.is_online === true || 
                             fields.is_online === 'true' || 
                             fields.active === true || 
                             fields.active === 'true' || 
                             fields.is_active === true || 
                             fields.is_active === 'true' ||
                             false;
              
              // Try to find owner field
              let owner: string;
              if (typeof fields.owner === 'string') {
                owner = fields.owner;
              } else if (fields.owner && typeof fields.owner === 'object' && fields.owner !== null) {
                // Try to extract address from object
                const possibleAddress = Object.values(fields.owner).find(
                  (val): val is string => typeof val === 'string' && val.startsWith('0x')
                );
                owner = possibleAddress || '';
              } else {
                owner = '';
              }
              
              const printer: Printer = {
                id,
                alias,
                online,
                owner
              };
              
              return [printer];
            } catch (e) {
              console.error('Error parsing printer data:', e);
              return [];
            }
          });

        setPrinters(parsedPrinters);
      } catch (err) {
        console.error('Error fetching printers:', err);
        setError('Failed to fetch printers data');
        setPrinters([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrinters();
  }, [suiClient, reloadFlag]);

  const reload = () => setReloadFlag(prev => prev + 1);

  return {
    printers,
    isLoading,
    error,
    reload
  };
} 