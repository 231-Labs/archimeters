import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

// Contract addresses - Phase 2.5 (Day 2 - 2025-11-07)
export const PACKAGE_ID = '0xb1c35c962187b1b2eebe934b69300fba986efb187297b2abfaff7f1711275dd3';
export const STATE_ID = '0x487442cd090c87f150e647acf23972ba2181b2a08d3c87f25d01e9f522800623';
export const ATELIER_STATE_ID = '0x164c661144d99e752869476844090bf43c3a57b8aa5d81e0b901c89db351e56d';
export const UPGRADE_CAP = '0x2ab8a8dc4433230cec93899899459dba44d66a9cfc9bf56df86ce2d641f5f78f';

export const ATELIER_TRANSFER_POLICY = '0xc3847aedaea432d60aae13bb03d247818ed032baa58ea12ac86f4a7619008d3a';
export const ATELIER_TRANSFER_POLICY_CAP = '0xd30ac43b168d30cee8b385cb65ba70f5fcf29fc4e530936dc5ac9ba2b1e71235';
export const SCULPT_TRANSFER_POLICY = '0xfd0a3358958b7d5d51b52a89c06247375fbacfe36f2e739f114eeb540cb2cf43';
export const SCULPT_TRANSFER_POLICY_CAP = '0x47f129fd1fdd7e6a2da4dd3450b466a921882227822b0ae80ed9bd8aaf999f7f';

export const MEMBERSHIP_DISPLAY = '0xa02e3269c5f532dba6955bd9d246278cfb2efa13a8ae636bc9035cb35c83f96f';
export const ATELIER_DISPLAY = '0x959633d91f630861c43ce8531266c7737cbc196ab1c7e0b22d821c567717040a';
export const SCULPT_DISPLAY = '0x77495149fd4679a9eeedd1ed3db3b700539b9973b35f68ef2e221059e88cac3f';

export const PUBLISHER_ARCHIMETERS = '0xd7fc8ca31c419ed76de604ddc87b359b5c39c51be52ee2fe222eafbeb332373e';
export const PUBLISHER_ATELIER = '0xb89f8d030e5810c88d849a97f138a537ae8c870c9a6d063d3aec8350413118ea';
export const PUBLISHER_SCULPT = '0xa1f0467633a3282eb7649219ea06eda0ee401990fd2a59301879c058a099e570';

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
  structure: string,
  paramKeys: string[],
  paramValues: number[],
  priceInMist: number,
) => {
  const tx = new Transaction();
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);
  
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
      tx.pure.string(structure),
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