import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';

/**
 * Move event queries (queryEvents) are not exposed on SuiGrpcClient's core transport yet.
 * This lightweight JSON-RPC client is used only for event pagination; all other reads use gRPC via dApp Kit.
 */
const clients: Partial<Record<'testnet', SuiJsonRpcClient>> = {};

export function getSuiJsonRpcClientForEvents(network: 'testnet' = 'testnet'): SuiJsonRpcClient {
  if (!clients[network]) {
    clients[network] = new SuiJsonRpcClient({
      url: getJsonRpcFullnodeUrl(network),
      network,
    });
  }
  return clients[network]!;
}
