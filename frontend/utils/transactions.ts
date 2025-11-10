import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

// Contract addresses - Day 6 (2025-11-10) - PoolCap Tradable + Shared Atelier
export const PACKAGE_ID = '0x8c902302be5b2cb272aa26d9486439caaab1fdd306610df473d7ebf5802c4165';
export const STATE_ID = '0xd4ba9ad12cdc47fb99b69edc0634cb8357d50d953a3ca6e718325f8112ff0452';
export const ATELIER_STATE_ID = '0xc9c059ea80f51ab23fbbe835377ff629c5a7dce26e70487a86cf7d73a641c249';
export const UPGRADE_CAP = '0xcd085845e5135e2f9837b0f557ae5caf1cb36b9f7d9f8edf4386c5e3372f8b8c';

export const ATELIER_TRANSFER_POLICY = '0x653303deeee38f47636d923d9cef0c3a766f81572b6c76a727b775a9bd7a5f81';
export const ATELIER_TRANSFER_POLICY_CAP = '0x24546343bf83b978324cd7a7e0cc14a6860e0338d9bd21f41fc4275007fab735';
export const SCULPT_TRANSFER_POLICY = '0x73a8e4cb4b7e3675f30a4f8636dd14d8b22adb3607e9f9a56f4be459f55fec0c';
export const SCULPT_TRANSFER_POLICY_CAP = '0xfb60c2a6c8ed45a7c6cc3bc0f14d87da126868dcef2e6fc82d9bb87b7c8d7b17';

export const MEMBERSHIP_DISPLAY = '0x4563db890232f0b08ffcb6ee9a2f4ae520ceb905c9192aefea2fb565b6d4f0a3';
export const ATELIER_DISPLAY = '0x3116df5a28b90a195a5af618d8b1d07828b20ce5d188242419ab140453549742';
export const SCULPT_DISPLAY = '0x29c207e121a2129b05cef6d3bd70aa25734c461e2dc2ca8dba3a8acf5e304c94';

export const PUBLISHER_ARCHIMETERS = '0x68c566f51a71bc15bd93fb315580ff0adc88bcf286f4d8e117a5ccd27bbde6a2';
export const PUBLISHER_ATELIER = '0x6a509f7d21710531a2870f429d31e73d4576427353266db4b8069badeaadedeb';
export const PUBLISHER_SCULPT = '0x8636dd103fa1c432fcb2ceb650ba354985a5522c9082d251246291708ed0b72f';

export const EUREKA_PACKAGE_ID = '0xdf87f76e34fb02000a00fd6a58e5d7b5e1f1d76b1a6399ff7079cf7c9991bd2a';
export const PRINTER_REGISTRY = '0x4aefe6483a8bbc5258b7668c867291581800da1d7c913c923a2c64a3beecfc3c';

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
  payment?: string,
) => {
  const tx = new Transaction();
  const target = payment
    ? `${EUREKA_PACKAGE_ID}::eureka::create_and_assign_print_job`
    : `${EUREKA_PACKAGE_ID}::eureka::create_and_assign_print_job_free`;
  
  const args = payment
    ? [tx.object(printerId), tx.object(sculptId), tx.object(payment)]
    : [tx.object(printerId), tx.object(sculptId)];
  
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