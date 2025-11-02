import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

// ============================================================================
// PREVIOUS VERSION (Backup for rollback if needed)
// ============================================================================
// export const PACKAGE_ID = '0x64ec0abe4f0c79ab509fe2eb61c37e584ed1681d274926216bfe5113a07f5d33';
// export const STATE_ID = '0x5bca31807dd1c1916127f89fb875cf3cc13ed923c391ef945b9a5e75708abecf';
// export const ATELIER_STATE_ID = '0x8ffae89c8b903adf879a6b0a00c7454f68774a0110017240a1a15284e151d5d9';

// ============================================================================
// CURRENT VERSION - Deployment: FE8qibrcLuq4zUc7hstrHNF3JV8a4WWHW8AX3zcvqbC9
// Deployed: 2025-11-02, Epoch: 906
// Fixed: Removed duplicate price conversion (price * ONE_SUI)
// ============================================================================

export const PACKAGE_ID = '0x5712bc99406bf71c386f4641f7fc31e67de74b12a4fceb569325bf29e09c614c';
export const STATE_ID = '0x0cec121bf193a38e360bcd19c604e2a6ad503f82c977b580ad228d5ef844e95d';
export const ATELIER_STATE_ID = '0x9a221a3eaa36c8b54c7edfa950040358d154c2352c6da3d4c7a3c52edfc55970';
export const SCULPT_TRANSFER_POLICY = '0xca68f6e68fa75acdf68149119127c67dbce195f4cca996775d07526331aeb213';
export const UPGRADE_CAP = '0xa7fa8c9bf2dbcba817fd61ed10e0963735749a59e0a7a1cb9edc2d8a6c090e27';

// Display objects
export const MEMBERSHIP_DISPLAY = '0xf9a238152941c98c44bdeaaaf387f3ca87f4c7c36eb15b3f6285ae97fb684362';
export const ATELIER_DISPLAY = '0xaab0dd12dbada85c3c1ea2f3b1ff974aff4af82cc644ff85733213ff4477f88f';
export const SCULPT_DISPLAY = '0xfade6150c449da399f24dec2f8055dd6eee935014b756f99559cf7a3004027ee';

// Publisher objects
export const PUBLISHER_ARCHIMETERS = '0x2d5c8cde03f10b2f5a16cda6cef976156e06607bd45fe7cd4267bcc5de5941c3';
export const PUBLISHER_ATELIER = '0x0b9ca142c15c2205ab9c564d386aabb96af60477df4e04e62db32ae2ab73caa4';
export const PUBLISHER_SCULPT = '0x77d8509b0caf644df69632e057fedab9f0b301a397dd3e66fc1282c577b53ad5';

// Transfer Policy Cap
export const SCULPT_TRANSFER_POLICY_CAP = '0xd0086918373f4ac082db9df9089203d3b2ffcacbd7afa322844204fef771eeb4';

// External dependencies
export const EUREKA_PACKAGE_ID = '0xdf87f76e34fb02000a00fd6a58e5d7b5e1f1d76b1a6399ff7079cf7c9991bd2a';
export const PRINTER_REGISTRY = '0x4aefe6483a8bbc5258b7668c867291581800da1d7c913c923a2c64a3beecfc3c';

// Type definitions
export const MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`;
export const ATELIER_TYPE = `${PACKAGE_ID}::atelier::Atelier`;
export const SCULPT_TYPE = `${PACKAGE_ID}::sculpt::Sculpt`;

// Constants
export const SUI_CLOCK = '0x6';
export const MIST_PER_SUI = 1_000_000_000;

const PARAMETER_INPUT_TYPE = `${PACKAGE_ID}::atelier::ParameterInput`;

export const mintMembership = async (username: string, description: string) => {
  
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::archimeters::mint_membership`,
    arguments: [
      tx.object(STATE_ID),
      tx.pure(bcs.string().serialize(username).toBytes()),
      tx.pure(bcs.string().serialize(description).toBytes()),
      tx.object('0x6'),
    ],
  });
  return tx;
};

export interface ParameterInput {
  key: string;
  param_type: string;
  label: string;
  min_value: number;
  max_value: number;
  default_value: number;
}

export const createArtlier = async (
  artlierState: string,
  membershipId: string,
  name: string,
  photo: string,
  data: string,
  algorithm: string,
  clock: string,
  price: number,
  parameters: ParameterInput[],
) => {
  const tx = new Transaction();
  
  console.log('=== Parameters Debug ===');
  console.log('Parameter count:', parameters.length);
  console.log('Parameters:', JSON.stringify(parameters, null, 2));
  console.log('Price (MIST):', price);
  
  // Extract each field into separate vectors (new approach - avoids struct serialization issues)
  const paramKeys = parameters.map(p => p.key);
  const paramTypes = parameters.map(p => p.param_type);
  const paramLabels = parameters.map(p => p.label);
  const paramMinValues = parameters.map(p => p.min_value);
  const paramMaxValues = parameters.map(p => p.max_value);
  const paramDefaultValues = parameters.map(p => p.default_value);
  
  console.log('Keys:', paramKeys);
  console.log('Types:', paramTypes);
  console.log('Labels:', paramLabels);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier::mint_atelier`,
    arguments: [
      tx.object(artlierState),
      tx.object(membershipId),
      tx.pure.string(name),
      tx.pure.string(photo),
      tx.pure.string(data),
      tx.pure.string(algorithm),
      tx.object(clock),
      tx.pure.u64(price),
      // Pass separate vectors instead of vector<struct>
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


export const mintSculpt = async (
  artlierId: string,
  membershipId: string,
  kioskId: string,
  kioskCapId: string,
  alias: string,
  blueprint: string,
  structure: string,
  paramKeys: string[],
  paramValues: number[],
  clock: string = '0x6',
) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::sculpt::mint_sculpt`,
    arguments: [
      tx.object(artlierId),
      tx.object(membershipId),
      tx.object(kioskId),
      tx.object(kioskCapId),
      tx.pure(bcs.string().serialize(alias).toBytes()),
      tx.pure(bcs.string().serialize(blueprint).toBytes()),
      tx.pure(bcs.string().serialize(structure).toBytes()),
      tx.pure(bcs.vector(bcs.string()).serialize(paramKeys).toBytes()),
      tx.pure(bcs.vector(bcs.u64()).serialize(paramValues).toBytes()),
      tx.gas, // Use gas coin directly for payment
      tx.object(clock),
    ],
  });
  return tx;
};

export const withdrawAtelierPool = async (
  atelierId: string,
  cap: string,
  amount: number,
  recipient: string,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier::withdraw_pool`,
    arguments: [
      tx.object(atelierId),
      tx.object(cap),
      tx.pure(bcs.u64().serialize(amount).toBytes()),
      tx.pure(bcs.Address.serialize(recipient).toBytes()),
    ],
  });
  return tx;
}

export const printSculpt = async (
  sculptId: string,
  printerId: string,
  payment?: string,
) => {
  const tx = new Transaction();
  
  if (!payment) {
    tx.moveCall({
      target: `${EUREKA_PACKAGE_ID}::eureka::create_and_assign_print_job_free`,
      arguments: [
        tx.object(printerId),
        tx.object(sculptId),
      ],
    });
  } else {
    tx.moveCall({
      target: `${EUREKA_PACKAGE_ID}::eureka::create_and_assign_print_job`,
      arguments: [
        tx.object(printerId),
        tx.object(sculptId),
        tx.object(payment),
      ],
    });
  }
  
  return tx;
}