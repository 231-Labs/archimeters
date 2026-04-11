import { createDAppKit } from '@mysten/dapp-kit-react';
import { SuiGrpcClient } from '@mysten/sui/grpc';

const GRPC_URLS: Record<'testnet', string> = {
  testnet: 'https://fullnode.testnet.sui.io:443',
};

export const dAppKit = createDAppKit({
  networks: ['testnet'],
  defaultNetwork: 'testnet',
  createClient: (network) =>
    new SuiGrpcClient({
      network,
      baseUrl: GRPC_URLS[network as keyof typeof GRPC_URLS] ?? GRPC_URLS.testnet,
    }),
});

declare module '@mysten/dapp-kit-react' {
  interface Register {
    dAppKit: typeof dAppKit;
  }
}
