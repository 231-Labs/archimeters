import type { SuiClientTypes } from '@mysten/sui/client';
import type { SuiGrpcClient } from '@mysten/sui/grpc';

export async function listAllOwnedObjectsByType(
  client: Pick<SuiGrpcClient, 'listOwnedObjects'>,
  owner: string,
  type: string,
  options?: { pageSize?: number; includeJson?: boolean }
): Promise<SuiClientTypes.Object<{ json: true }>[]> {
  const pageSize = options?.pageSize ?? 50;
  const includeJson = options?.includeJson ?? true;
  const collected: SuiClientTypes.Object<{ json: true }>[] = [];
  let cursor: string | null = null;

  for (;;) {
    const res = (await client.listOwnedObjects({
      owner,
      type,
      limit: pageSize,
      cursor,
      include: includeJson ? { json: true } : {},
    })) as SuiClientTypes.ListOwnedObjectsResponse<{ json: true }>;
    collected.push(...res.objects);
    if (!res.hasNextPage || !res.cursor) break;
    cursor = res.cursor;
  }

  return collected;
}
