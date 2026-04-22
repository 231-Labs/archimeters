import { useCurrentAccount, useCurrentClient } from '@mysten/dapp-kit-react';
import { useState, useEffect } from 'react';
import { KioskClient } from '@mysten/kiosk';
import { PACKAGE_ID } from '@/utils/transactions';
import { extractBlobId } from '@/utils/formatters';
import { extractObjectIdsFromMoveValue, moveObjectFields, pickField } from '@/lib/sui-object-json';

export interface BaseVaultItem {
  id: string;
  isLoading: boolean;
  error: string | null;
}

export interface AtelierItem extends BaseVaultItem {
  type: 'atelier';
  photoBlobId: string;
  title: string;
  author: string;
  price: string;
  pool: string;
  poolId: string;
  publish_time: string;
}

export interface SculptItem extends BaseVaultItem {
  type: 'sculpt';
  blueprint: string;
  photoBlobId: string;
  alias: string;
  creator: string;
  printed: string;
  glbFile: string; // GLB file for 3D preview
  structure: string; // STL file for printing (optional, encrypted)
  time: string;
  kioskId: string;
  kioskCapId: string;
}

export type VaultItem = AtelierItem | SculptItem;

export interface KioskInfo {
  kioskId: string;
  kioskCapId: string;
}

export function useUserItems(fieldKey: 'ateliers' | 'sculptures') {
  const currentAccount = useCurrentAccount();
  const suiClient = useCurrentClient();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [kioskInfo, setKioskInfo] = useState<KioskInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      setError(null);

      if (!currentAccount?.address) {
        setError('Please connect your wallet.');
        setItems([]);
        setIsLoading(false);
        return;
      }

      try {
        if (fieldKey === 'sculptures') {
          await loadSculptsViaEvents();
        } else {
          await loadAteliers();
        }
      } catch (err) {
        setError(`Failed to load ${fieldKey}.`);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    const loadSculptsViaEvents = async () => {
      const kioskClient = new KioskClient({
        client: suiClient as never,
        network: 'testnet',
      });

      // Source of truth for "my sculpts" (same pattern as ateliers from MemberShip.ateliers).
      const { objects: membershipObjects } = await suiClient.listOwnedObjects({
        owner: currentAccount!.address,
        type: `${PACKAGE_ID}::archimeters::MemberShip`,
        limit: 1,
        include: { json: true },
      });

      const mFields = membershipObjects[0]
        ? moveObjectFields(membershipObjects[0].json)
        : null;
      const sculpturesRaw = mFields ? pickField(mFields, 'sculptures') : undefined;
      const membershipSculptIds = extractObjectIdsFromMoveValue(sculpturesRaw);

      const { kioskOwnerCaps, kioskIds } = await kioskClient.getOwnedKiosks({
        address: currentAccount!.address,
      });

      let currentKioskInfo: KioskInfo | null = null;
      if (kioskOwnerCaps.length > 0 && kioskIds.length > 0) {
        const firstKiosk = kioskOwnerCaps[0];
        currentKioskInfo = {
          kioskId: firstKiosk.kioskId,
          kioskCapId: firstKiosk.objectId,
        };
        setKioskInfo(currentKioskInfo);
      } else {
        setKioskInfo(null);
      }

      const allSculptIdSet = new Set<string>(membershipSculptIds);
      const sculptToKioskMap = new Map<string, { kioskId: string; kioskCapId: string }>();

      // Kiosk / indexer may omit "0x" on address segments; match both forms.
      const pkgLower = PACKAGE_ID.toLowerCase();
      const pkgNo0x = pkgLower.replace(/^0x/, '');

      for (let i = 0; i < kioskIds.length; i++) {
        const kioskId = kioskIds[i];
        const kioskCapId = kioskOwnerCaps[i].objectId;

        try {
          const kioskData = await kioskClient.getKiosk({
            id: kioskId,
            options: {
              withKioskFields: true,
              withObjects: true,
            },
          });

          for (const item of kioskData.items) {
            const t = (item.type || '').toLowerCase();
            const isSculpt = t.includes('sculpt::sculpt');
            const isCurrentPackage = t.includes(pkgLower) || t.includes(pkgNo0x);
            if (!isSculpt || !isCurrentPackage) continue;
            const oid =
              item.objectId ||
              (item as { id?: string }).id ||
              (item as { object_id?: string }).object_id;
            if (!oid) continue;
            sculptToKioskMap.set(oid, { kioskId, kioskCapId });
            allSculptIdSet.add(oid);
          }
        } catch {
          continue;
        }
      }

      (window as any).__sculptToKioskMap = sculptToKioskMap;

      const allSculptIds = Array.from(allSculptIdSet);

      if (allSculptIds.length === 0) {
        setItems([]);
        if (!membershipObjects.length) {
          setError('No Membership NFT found. Please mint your Membership first.');
        }
        return;
      }

      const { objects: sculptRows } = await suiClient.getObjects({
        objectIds: allSculptIds,
        include: { json: true },
      });

      const parsedItems: VaultItem[] = [];

      for (const object of sculptRows) {
        if (object instanceof Error) continue;
        const fields = moveObjectFields(object.json);
        if (!fields) continue;

        const sculptKioskInfo = sculptToKioskMap.get(object.objectId);
        const kioskId = sculptKioskInfo?.kioskId || currentKioskInfo?.kioskId || '';
        const kioskCapId = sculptKioskInfo?.kioskCapId || currentKioskInfo?.kioskCapId || '';

        let structureValue = '';
        const structureRaw = pickField(fields, 'structure');
        if (structureRaw && typeof structureRaw === 'object') {
          const structureOption = structureRaw as { vec?: unknown[] };
          if (Array.isArray(structureOption.vec) && structureOption.vec.length > 0) {
            structureValue = String(structureOption.vec[0]);
          }
        }

        const blueprint = String(pickField(fields, 'blueprint') ?? '');
        parsedItems.push({
          id: object.objectId,
          type: 'sculpt',
          blueprint,
          photoBlobId: extractBlobId(blueprint) || '',
          alias: String(pickField(fields, 'alias') ?? ''),
          creator: String(pickField(fields, 'creator') ?? ''),
          printed: String(pickField(fields, 'printed') ?? '0'),
          glbFile: String(pickField(fields, 'glb_file', 'glbFile') ?? ''),
          structure: structureValue,
          time: pickField(fields, 'time')
            ? new Date(Number(pickField(fields, 'time'))).toLocaleDateString('en-CA')
            : '',
          kioskId,
          kioskCapId,
          isLoading: false,
          error: null,
        } as SculptItem);
      }

      setItems(parsedItems);
    };

    const loadAteliers = async () => {
      const { objects } = await suiClient.listOwnedObjects({
        owner: currentAccount!.address,
        type: `${PACKAGE_ID}::archimeters::MemberShip`,
        limit: 1,
        include: { json: true },
      });

      if (!objects.length) {
        setError('No Membership NFT found. Please mint your Membership first.');
        setItems([]);
        return;
      }

      const mFields = moveObjectFields(objects[0].json);
      const ateliersRaw = mFields ? pickField(mFields, 'ateliers') : undefined;
      const objectIds = extractObjectIdsFromMoveValue(ateliersRaw);
      
      try {
        const kioskClient = new KioskClient({
          client: suiClient as never,
          network: 'testnet',
        });

        const { kioskOwnerCaps } = await kioskClient.getOwnedKiosks({ 
          address: currentAccount!.address 
        });

        if (kioskOwnerCaps.length > 0) {
          const firstKiosk = kioskOwnerCaps[0];
          setKioskInfo({
            kioskId: firstKiosk.kioskId,
            kioskCapId: firstKiosk.objectId,
          });
        }
      } catch (err) {
        console.error('Error fetching kiosk info for ateliers:', err);
      }

      if (objectIds.length === 0) {
        setItems([]);
        return;
      }

      const { objects: atelierRows } = await suiClient.getObjects({
        objectIds,
        include: { json: true },
      });

      const parsedItems: VaultItem[] = [];

      for (const object of atelierRows) {
        if (object instanceof Error) continue;
        const fields = moveObjectFields(object.json);
        if (!fields) continue;

        const poolId = String(pickField(fields, 'pool_id', 'poolId') ?? '');
        let poolBalance = '0';

        if (poolId) {
          try {
            const { object: poolRow } = await suiClient.getObject({
              objectId: poolId,
              include: { json: true },
            });
            const poolFields = moveObjectFields(poolRow.json);
            if (poolFields) {
              poolBalance = String(pickField(poolFields, 'balance') ?? '0');
            }
          } catch (err) {
            console.error('Error fetching pool balance:', err);
          }
        }

        parsedItems.push({
          id: object.objectId,
          type: 'atelier',
          photoBlobId: String(pickField(fields, 'photo') ?? ''),
          title: String(pickField(fields, 'name') ?? ''),
          author: String(
            pickField(fields, 'current_owner', 'currentOwner') ??
              pickField(fields, 'original_creator', 'originalCreator') ??
              ''
          ),
          price: String(pickField(fields, 'price') ?? ''),
          pool: poolBalance,
          poolId,
          publish_time: pickField(fields, 'publish_time', 'publishTime')
            ? new Date(Number(pickField(fields, 'publish_time', 'publishTime'))).toLocaleDateString('en-CA')
            : '',
          isLoading: false,
          error: null,
        } as AtelierItem);
      }

      setItems(parsedItems);
    };

    loadItems();
  }, [currentAccount, suiClient, reloadFlag, fieldKey]);

  const reload = () => setReloadFlag((prev) => prev + 1);

  return {
    items,
    kioskInfo,
    isLoading,
    error,
    reload,
  };
}
