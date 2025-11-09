import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

// Contract addresses - Day 4 (2025-11-09) - Seal Integration
export const PACKAGE_ID = '0xdeac9eea36d5ae4941a8ca9e120ed4ad1890440b97c788838c274ad8f5cfee21';
export const STATE_ID = '0x90604227936f4407b1d92621067c2a93925ca72b3b227b9132883eeb1958c73d';
export const ATELIER_STATE_ID = '0x47323c903cce10ebff83229d1a7b6515f3bdab22668a2696a7b2428679ccf060';
export const UPGRADE_CAP = '0xa2383c792d115224cf6f3a7d6b3ac853bc74bf47df94377d954f5f033d1ce837';

export const ATELIER_TRANSFER_POLICY = '0xe7156b1e24b06a52119453110b0416ae1d3ace2362850d240a36ab5933dc14c9';
export const ATELIER_TRANSFER_POLICY_CAP = '0x4ef9610bbaba14d47f0729da184e08ace5271043d61fd9a8a5df0c03e9125a5e';
export const SCULPT_TRANSFER_POLICY = '0x62d6a75334d53c5049b72a22508323087d58e07a1084c5d2523f7326902928dd';
export const SCULPT_TRANSFER_POLICY_CAP = '0x40381a02e685b64ee0ac43874625b47d8afab407ce01d594bc60c3cc17e61329';

export const MEMBERSHIP_DISPLAY = '0x6d0e006de624243acfd71ccfa1f0751b2b07d03651ed9013d23d33be758bcd8a';
export const ATELIER_DISPLAY = '0xd1ec3882e05b837a56155c08f3728dc4d0291b54414258281f4481d061c953ed';
export const SCULPT_DISPLAY = '0x20857acbd3fffb962b57634aac252bc446c2dedede2237ec759d5f9a2b4b81c3';

export const PUBLISHER_ARCHIMETERS = '0xb3215049dbc1fe36dba8fa44e605a8da72d04048271257bdb2150cf00cea9f70';
export const PUBLISHER_ATELIER = '0xea43b3f265ddd750536f53b5ab4d4710206617c0273021c2beec396ca440c670';
export const PUBLISHER_SCULPT = '0xea8804cec0db02cbde1a6fdc6d8177a7830df4b13bcacbb6844238205345fb6e';

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
  paramKeys: string[],
  paramValues: number[],
  priceInMist: number,
) => {
  const tx = new Transaction();
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);
  
  // Serialize Option<String> for structure
  // If structure is null, serialize as None; otherwise as Some(string)
  const structureOption = structure 
    ? bcs.option(bcs.string()).serialize(structure)
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
      tx.pure(bcs.vector(bcs.string()).serialize(paramKeys)),
      tx.pure(bcs.vector(bcs.u64()).serialize(paramValues)),
      paymentCoin,
      tx.object(SUI_CLOCK),
    ],
  });
  return tx;
};

export const withdrawAtelierPool = (
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