import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

// Contract addresses - Updated with simplified seal_approve (PrintJob-based auth)
export const PACKAGE_ID = '0xc1814c4cbd4c23f306e886c7f8aace3ce1635d0a6e896b3bf35835139945d693';
export const STATE_ID = '0x85963a4931321216f7437d2553bee6f0f5e9c84ee99365593080cc4e49eacae4'; // archimeters::State
export const ATELIER_STATE_ID = '0x798380c7609c7baf783bfda0e605881dab053890fcfdd6b37df38de53d34416f'; // atelier::AtelierState
export const UPGRADE_CAP = '0xafaac9c484de17c83cd7be20557fe3fb9bbd1352864f549402cc463c88f06404';

export const ATELIER_TRANSFER_POLICY = '0x2917ca572a3a08ddd63b2c905a3e971306121781544a27c4be8cb0ab3cc321af';
export const ATELIER_TRANSFER_POLICY_CAP = '0x51878c1f00080915eb1aec7860adeb283fb8178434c89eabfe98d180ceb78005';
export const SCULPT_TRANSFER_POLICY = '0x9262f6a26fb1b5f57651d5019a60f83e7aebd093e7e03553c6ba681b5987eb28';
export const SCULPT_TRANSFER_POLICY_CAP = '0xf8a24870fde03b88a0110e57ec110f716eb32217bb8ad35187de50c1254768b0';

export const MEMBERSHIP_DISPLAY = '0xf6967fbf6e6a46e32bcf0e41edaf4820db695375994c70302075c3df3261d7e6';
export const ATELIER_DISPLAY = '0x2eb95e690958d9939d3960f52f4306c9cdd348338913a24c9b3cf3122a774346';
export const SCULPT_DISPLAY = '0xc28077564e7ef5972741e945a3b65225d0220f7f35778b28242a46f8927ce55b';

export const PUBLISHER_ARCHIMETERS = '0xe2aef16ac3ae67382444e9d57f5a916b5218506f626f47ae1a2b3a688f500919';
export const PUBLISHER_ATELIER = '0xd3534970becc4469f714e6bf2a998d04878d6ec250e103e6855e49cce9c32e55';
export const PUBLISHER_SCULPT = '0xd17920c9d31da535739ac08e8f91fa697345af1f8288dfddfedcb75d17cf4049';

export const EUREKA_PACKAGE_ID = '0x4e43c7642828f9d8c410a47d7ed80b3df7711e49662c4704549dc05b23076bec';
export const PRINTER_REGISTRY = '0xc368483b3bb2d6695d44f4e53e75a82cd5db36e32c59298f56452945eb46e302';

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