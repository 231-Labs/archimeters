import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0xdf87f76e34fb02000a00fd6a58e5d7b5e1f1d76b1a6399ff7079cf7c9991bd2a';
export const EUREKA_PACKAGE_ID = '0xdf87f76e34fb02000a00fd6a58e5d7b5e1f1d76b1a6399ff7079cf7c9991bd2a'
export const STATE_ID = '0xfb658631c7df6a1fca3b7ee4486682e3883dae0911583170f675a7b6a0b3b9fd';
export const ATELIER_STATE_ID = '0x6bf30b1d9481819936b1787ac13671b94fac60d84aa7d7735d33f51c1bee4052';
export const PRINTER_REGISTRY = `0x4aefe6483a8bbc5258b7668c867291581800da1d7c913c923a2c64a3beecfc3c`;
export const MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`;
export const SUI_CLOCK = '0x6';
export const MIST_PER_SUI = 1_000_000_000;

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

export const createArtlier = async (
  artlierState: string,
  membershipId: string,
  name: string,
  photo: string,
  data: string,
  algorithm: string,
  clock: string,
  price: number,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier::mint_atelier`,
    arguments: [
      tx.object(artlierState),
      tx.object(membershipId),
      tx.pure(bcs.string().serialize(name).toBytes()),
      tx.pure(bcs.string().serialize(photo).toBytes()),
      tx.pure(bcs.string().serialize(data).toBytes()),
      tx.pure(bcs.string().serialize(algorithm).toBytes()),
      tx.object(clock),
      tx.pure(bcs.u64().serialize(price).toBytes()),
    ],
  });
  return tx;
};


export const mintSculpt = async (
  artlierId: string,
  membershipId: string,
  alias: string,
  blueprint: string,
  structure: string,
  clock: string = '0x6',
) => {
  const tx = new Transaction();
  
  // Instead of creating a separate coin and having ownership issues,
  // use tx.gas directly and let the contract handle the splitting
  tx.moveCall({
    target: `${PACKAGE_ID}::sculpt::mint_sculpt`,
    arguments: [
      tx.object(artlierId),
      tx.object(membershipId),
      tx.pure(bcs.string().serialize(alias).toBytes()),
      tx.pure(bcs.string().serialize(blueprint).toBytes()),
      tx.pure(bcs.string().serialize(structure).toBytes()),
      tx.gas, // Use gas coin directly
      tx.object(clock),
    ],
  });
  return tx;
};

export const withdrawAtelierPool = async (
  atelierId: string,
  cap: string,
  amount: number,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier::withdraw_pool`,
    arguments: [
      tx.object(atelierId),
      tx.object(cap),
      tx.pure(bcs.u64().serialize(amount).toBytes()),
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