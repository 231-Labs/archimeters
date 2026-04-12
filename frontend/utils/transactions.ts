import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

// Contract addresses — testnet republish 2026-04-12 (tx EmhtHeTz… / 8ZLZZPb…)
export const PACKAGE_ID = '0x51d9c918431258ae6748b50234d0da3d436e6df8e2087fa1446913e390336ab8';
export const STATE_ID = '0x2112ac0c1f6849037d679345a63725bf04e5509fa66bc1142f75db3303e941b5'; // archimeters::State
export const ATELIER_STATE_ID = '0xcee0db8c9506305d8946c2152619288494ae9300ea87dc5a8a7ee2b20cf76c20'; // atelier::AtelierState
export const UPGRADE_CAP = '0xf6d985e84d86821f1d36406f346523f0cefe7d98821ca625db36714b62aa7a0d';

export const ATELIER_TRANSFER_POLICY = '0x2af0cf46dd176b491662fc452dc0e33391fda1fe0348b28dba2fb047b6cc145a';
export const ATELIER_TRANSFER_POLICY_CAP = '0x3af7f72267333a35ef8701c72b89cd73b1d0ae9c3d3cd921805c61d9634b26e7';
export const SCULPT_TRANSFER_POLICY = '0x3c9b8a7dc39dbbac12b40d82c0bbcd818be37d0bf59f66b59735f5f3eab71a6d';
export const SCULPT_TRANSFER_POLICY_CAP = '0xac62a151f679dc6c594bc22b74b70a467229f737267ad6e6e24e2219e526fc86';

export const MEMBERSHIP_DISPLAY = '0xbc4a21a1dde7418cb717aaa9ce4f57babd00943fd67a0c22606c277af20253b3';
export const ATELIER_DISPLAY = '0x3d1c0d604a31884c786e347ded0a0492c8820f0f4d4173bedf79df620c7bb5a5';
export const SCULPT_DISPLAY = '0xeed04d30f7012e2974d22a179c1d821aa542dd6c6223c83175e4d41bccc7ee15';

export const PUBLISHER_ARCHIMETERS = '0x5b07419add5738159ffc2bd45ea4be80855b92c08c6224c229d9318970dbba49';
export const PUBLISHER_ATELIER = '0x6b6e18a792e5ae919fe6c09202c88bd5ddbb53353d9070e999c7da8c43df3001';
export const PUBLISHER_SCULPT = '0x8ccd32f4c1a79d74d73fb1a68647bf3633de7687906ea5533a0a1d18004bbe29';
/** Eureka Move package (Seal IBE namespace + print-job PTB targets). Set `NEXT_PUBLIC_EUREKA_PACKAGE_ID` to override. */
export const EUREKA_PACKAGE_ID =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_EUREKA_PACKAGE_ID) ||
  '0x1737bb093b90783dfe0e0056df602bdfa42fc417d91fed1e02a27a88b949c3b3';

/** Printer registry object for Eureka. Set `NEXT_PUBLIC_EUREKA_PRINTER_REGISTRY_ID` to override. */
export const PRINTER_REGISTRY =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_EUREKA_PRINTER_REGISTRY_ID) ||
  '0x3498e9fef83b29ef471d3070daf7764f3f9abcc982daa34fdf7fda9b612e9409';

// Type definitions
export const MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`;
export const ATELIER_TYPE = `${PACKAGE_ID}::atelier::Atelier<${PACKAGE_ID}::atelier::ATELIER>`;
export const SCULPT_TYPE = `${PACKAGE_ID}::sculpt::Sculpt<${PACKAGE_ID}::atelier::ATELIER>`;

export const SUI_CLOCK = '0x6';
export const MIST_PER_SUI = 1_000_000_000;
export const NETWORK = 'testnet';

export interface ParameterInput {
  key: string;
  param_type: string;
  label: string;
  min_value: number;
  max_value: number;
  default_value: number;
}

export const mintMembership = (username: string, description: string) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::archimeters::mint_membership`,
    arguments: [
      tx.object(STATE_ID),
      tx.pure.string(username),
      tx.pure.string(description),
      tx.object(SUI_CLOCK),
    ],
  });
  return tx;
};

export const createArtlier = (
  membershipId: string,
  name: string,
  photo: string,
  data: string,
  algorithm: string,
  price: number,
  parameters: ParameterInput[],
) => {
  const tx = new Transaction();
  
  const paramKeys = parameters.map(p => p.key);
  const paramTypes = parameters.map(p => p.param_type);
  const paramLabels = parameters.map(p => p.label);
  const paramMinValues = parameters.map(p => p.min_value);
  const paramMaxValues = parameters.map(p => p.max_value);
  const paramDefaultValues = parameters.map(p => p.default_value);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier::mint_atelier`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: [
      tx.object(ATELIER_STATE_ID),
      tx.object(membershipId),
      tx.pure.string(name),
      tx.pure.string(photo),
      tx.pure.string(data),
      tx.pure.string(algorithm),
      tx.object(SUI_CLOCK),
      tx.pure.u64(price),
      tx.pure(bcs.vector(bcs.string()).serialize(paramKeys)),
      tx.pure(bcs.vector(bcs.string()).serialize(paramTypes)),
      tx.pure(bcs.vector(bcs.string()).serialize(paramLabels)),
      tx.pure(bcs.vector(bcs.u64()).serialize(paramMinValues)),
      tx.pure(bcs.vector(bcs.u64()).serialize(paramMaxValues)),
      tx.pure(bcs.vector(bcs.u64()).serialize(paramDefaultValues)),
    ],
  });
  return tx;
};

export const mintSculpt = (
  atelierId: string,
  poolId: string,
  membershipId: string,
  kioskId: string,
  kioskCapId: string,
  alias: string,
  blueprint: string,
  glbFile: string,
  structure: string | null, // Optional STL blob ID
  sealResourceId: string | null, // Optional Seal resource ID
  paramKeys: string[],
  paramValues: number[],
  priceInMist: number,
) => {
  const tx = new Transaction();
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);
  
  // Debug logging
  console.log('🔍 mintSculpt called with:', {
    alias,
    glbFile,
    structure,
    sealResourceId,
    hasStructure: !!structure,
    hasSealResourceId: !!sealResourceId,
  });
  
  // Serialize Option<String> for structure
  const structureOption = structure 
    ? bcs.option(bcs.string()).serialize(structure)
    : bcs.option(bcs.string()).serialize(null);
  
  // Serialize Option<String> for seal_resource_id
  const sealResourceIdOption = sealResourceId
    ? bcs.option(bcs.string()).serialize(sealResourceId)
    : bcs.option(bcs.string()).serialize(null);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::sculpt::mint_sculpt`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: [
      tx.object(atelierId),
      tx.object(poolId),
      tx.object(membershipId),
      tx.object(kioskId),
      tx.object(kioskCapId),
      tx.pure.string(alias),
      tx.pure.string(blueprint),
      tx.pure.string(glbFile),
      tx.pure(structureOption),
      tx.pure(sealResourceIdOption),
      tx.pure(bcs.vector(bcs.string()).serialize(paramKeys)),
      tx.pure(bcs.vector(bcs.u64()).serialize(paramValues)),
      paymentCoin,
      tx.object(SUI_CLOCK),
    ],
  });
  return tx;
};

export const withdrawAtelierPool = (
  poolCapId: string,
  atelierId: string,
  poolId: string,
  amountInMist: number,
  recipient: string,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier::withdraw_pool`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: [
      tx.object(poolCapId),  // PoolCap must be first parameter now
      tx.object(atelierId),
      tx.object(poolId),
      tx.pure.u64(amountInMist),
      tx.pure.address(recipient),
    ],
  });
  return tx;
};

export const transferAtelierOwnership = (
  atelierId: string,
  newOwner: string,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier::transfer_ownership`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: [
      tx.object(atelierId),
      tx.pure.address(newOwner),
    ],
  });
  return tx;
};

export const updateCreatorRoyalty = (
  atelierId: string,
  royaltyBps: number,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier::update_creator_royalty`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: [
      tx.object(atelierId),
      tx.pure.u64(royaltyBps),
    ],
  });
  return tx;
};

export const printSculpt = (
  sculptId: string,
  printerId: string,
  kioskId: string,
  kioskCapId: string,
  payment?: string,
) => {
  const tx = new Transaction();
  
  // Use the new kiosk-aware functions that handle borrowing internally
  const target = payment
    ? `${EUREKA_PACKAGE_ID}::eureka::create_print_job_from_kiosk`
    : `${EUREKA_PACKAGE_ID}::eureka::create_print_job_from_kiosk_free`;
  
  const args = payment
    ? [
        tx.object(printerId),
        tx.object(kioskId),
        tx.object(kioskCapId),
        tx.pure.id(sculptId),
        tx.object(payment),
      ]
    : [
        tx.object(printerId),
        tx.object(kioskId),
        tx.object(kioskCapId),
        tx.pure.id(sculptId),
      ];
  
  tx.moveCall({ target, arguments: args });
  
  return tx;
};

// Marketplace functions
export const listAtelier = (
  kioskId: string,
  kioskCapId: string,
  atelierId: string,
  priceInMist: number,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier_marketplace::list_atelier`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: [
      tx.object(kioskId),
      tx.object(kioskCapId),
      tx.object(atelierId),
      tx.pure.u64(priceInMist),
    ],
  });
  return tx;
};

export const delistAtelier = (
  kioskId: string,
  kioskCapId: string,
  atelierId: string,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier_marketplace::delist_atelier`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: [
      tx.object(kioskId),
      tx.object(kioskCapId),
      tx.pure.id(atelierId),
    ],
  });
  return tx;
};

export const purchaseAtelier = (
  kioskId: string,
  atelierId: string,
  priceInMist: number,
  royaltyInMist: number,
) => {
  const tx = new Transaction();
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);
  const [royaltyCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(royaltyInMist)]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier_marketplace::purchase_atelier`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: [
      tx.object(kioskId),
      tx.pure.id(atelierId),
      paymentCoin,
      royaltyCoin,
      tx.object(ATELIER_TRANSFER_POLICY),
    ],
  });
  return tx;
};

export const takeAtelierFromKiosk = (
  kioskId: string,
  kioskCapId: string,
  atelierId: string,
  recipient: string,
) => {
  const tx = new Transaction();
  const [atelier] = tx.moveCall({
    target: `${PACKAGE_ID}::atelier_marketplace::take_from_kiosk`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: [
      tx.object(kioskId),
      tx.object(kioskCapId),
      tx.pure.id(atelierId),
    ],
  });
  
  tx.transferObjects([atelier], tx.pure.address(recipient));
  return tx;
};

export const setupAtelierRoyalty = (
  policyId: string,
  policyCapId: string,
  royaltyBps: number,
  beneficiary: string,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier_marketplace::setup_royalty`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: [
      tx.object(policyId),
      tx.object(policyCapId),
      tx.pure.u16(royaltyBps),
      tx.pure.address(beneficiary),
    ],
  });
  return tx;
};

export const calculateRoyalty = (priceInMist: number, royaltyBps: number): number => {
  return Math.floor((priceInMist * royaltyBps) / 10000);
};