import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

// Contract addresses - Updated with printer_id parameter (2025-11-12)
export const PACKAGE_ID = '0x9a4790f287d6571f1b984577a4a4bb8bfc656b7126c01aa8a8a8881dca073ba7';
export const STATE_ID = '0x11adcda2fefbf4df73fe3571b2d5299a04d7cca6296aab33abdcfe9015165e42'; // archimeters::State
export const ATELIER_STATE_ID = '0x01edfd05da07d9096da22d1c9ca542fdb93f6cafa95e892ebec110303a3efc21'; // atelier::AtelierState
export const UPGRADE_CAP = '0x8972f7f311d7042ece4e7c5d2e256f4d4b93f059379362164072bb24c9d3dc75';

export const ATELIER_TRANSFER_POLICY = '0x1066ed5202d07152ec59c55774b21712dff1a330f99f9d1fdf9d33d96096d13a';
export const ATELIER_TRANSFER_POLICY_CAP = '0xa022d04ba025efee2aa40dcaee835c688aeb9f0dd5f49875431501f24ea0b1a8';
export const SCULPT_TRANSFER_POLICY = '0x714acb68e72d2703d7c0f24b862d0fe1449ab9c1fd9cd24b119efd04f07220ed';
export const SCULPT_TRANSFER_POLICY_CAP = '0xc878eb182970f9a42f79a99099b2737d0c7a4d9c94959be75fd2792a06c46fd9';

export const MEMBERSHIP_DISPLAY = '0x4b25b15a38a093d5d35aae75fdd608a8fbbd16acc9e614f07891c8fc525d13ab';
export const ATELIER_DISPLAY = '0xd48fc0d0f05cd925712814761c23cb2c54375efcbc4203ee12749907efa16c19';
export const SCULPT_DISPLAY = '0xed2e0e0b22669680508ebb59ea80a9d770d4e10077092891421d7eb4354705ec';

export const PUBLISHER_ARCHIMETERS = '0xfc22092c5c0226891cf903356be9a0a9ef0f0c614051a0723363e355c7aa9263';
export const PUBLISHER_ATELIER = '0x32cd1ed914224f8bca42c407112d714cf1af99952b75d2ee17273211ea8ba238';
export const PUBLISHER_SCULPT = '0x32be213f6a31b9bad153f86ebd72cf0cde0c4e7a59464b8c5a223b800356a34a';

export const EUREKA_PACKAGE_ID = '0xc43f70a30c7de3bf10847f81b45279adfc0c1cc1a66f3acf10f1b5af3e1983ae';
export const PRINTER_REGISTRY = '0x53d254fb51dce1544799d68df5610b9fc8cb022de27e9da42e0ad520929cab73';

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