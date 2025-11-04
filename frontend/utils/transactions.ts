import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

// ============================================================================
// PREVIOUS VERSION - Deployment: FE8qibrcLuq4zUc7hstrHNF3JV8a4WWHW8AX3zcvqbC9
// Deployed: 2025-11-02, Epoch: 906 (Backup for rollback if needed)
// ============================================================================
// export const PACKAGE_ID = '0x5712bc99406bf71c386f4641f7fc31e67de74b12a4fceb569325bf29e09c614c';
// export const STATE_ID = '0x0cec121bf193a38e360bcd19c604e2a6ad503f82c977b580ad228d5ef844e95d';
// export const ATELIER_STATE_ID = '0x9a221a3eaa36c8b54c7edfa950040358d154c2352c6da3d4c7a3c52edfc55970';
// export const SCULPT_TRANSFER_POLICY = '0xca68f6e68fa75acdf68149119127c67dbce195f4cca996775d07526331aeb213';

// ============================================================================
// CURRENT VERSION - Deployment: DaXkXPwpUqsCk7ybSRn9hx4JMUFgCrKTakFMoPthfQLG
// Deployed: 2025-11-04, Epoch: 908
// Changes: Phase 1.5 - Atelier & Sculpt Generics
//   - Atelier<phantom T> and Sculpt<phantom T>
//   - Type-safe relationship enforcement
//   - Added typeArguments to all contract calls
// ============================================================================

export const PACKAGE_ID = '0x80e08281d763b4f020c106e1a6a10108058bef89c3054cb85fa894a3bc4c3f09';
export const STATE_ID = '0x192bd3eb1fc09c0e9815bf39549807c00456fdd018e5765c7c5904db78f7e2e4';
export const ATELIER_STATE_ID = '0xce5b9be03c5bfe7b5f5625575826ecef4a3f166fdb87370e8f453e7a146f5b88';
export const SCULPT_TRANSFER_POLICY = '0x7142c6057e2c765ef16d37dd6e0f41be8000d2f558ee5d8109dd080a71c65ca5';
export const UPGRADE_CAP = '0x834963d39f4006761ee4e50d3f610af7f17159e8ac2ac5c808994f3fc9056e98';

// Display objects
export const MEMBERSHIP_DISPLAY = '0xae9617ae3ab3b00164b9b384b3640ed310dbd1afdcbdbf99fa2c612b6de8d8c1';
export const ATELIER_DISPLAY = '0x005b63266359c357bd504fc56627b666c1fb204cd6e9ba4ddc24b068b898a5ea';
export const SCULPT_DISPLAY = '0x0016bc6fae9142ec9ad4fca65308cc0c49dfc3a65c4e4244e231b382ee517e9d';

// Publisher objects
export const PUBLISHER_ARCHIMETERS = '0xd2f7de8e7de73295893a72910deaa628b877a3071ef9c9c2a40cca013b3ee85e';
export const PUBLISHER_ATELIER = '0xa13518f50b1bed6cd7352f4bacfdbca83f4fd0bd74d094ec4b202b4a8c15a782';
export const PUBLISHER_SCULPT = '0x5e1b4ecc5a504d033d3599afeb4b00cd292df8ff51a6a729b8f8315423bf8c14';

// Transfer Policy Cap
export const SCULPT_TRANSFER_POLICY_CAP = '0x3080943a4fac94da1cf90c7d9853b23abe48372357ea4fc9d3d8af4cb2c11546';

// External dependencies
export const EUREKA_PACKAGE_ID = '0xdf87f76e34fb02000a00fd6a58e5d7b5e1f1d76b1a6399ff7079cf7c9991bd2a';
export const PRINTER_REGISTRY = '0x4aefe6483a8bbc5258b7668c867291581800da1d7c913c923a2c64a3beecfc3c';

// Type definitions (with generics)
export const MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`;
export const ATELIER_TYPE = `${PACKAGE_ID}::atelier::Atelier<${PACKAGE_ID}::atelier::ATELIER>`;
export const SCULPT_TYPE = `${PACKAGE_ID}::sculpt::Sculpt<${PACKAGE_ID}::atelier::ATELIER>`;

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
    // Add type argument for generic Atelier<ATELIER>
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
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
    // Add type argument for the generic Sculpt<ATELIER>
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
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
    // Add type argument for generic Atelier<ATELIER>
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
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