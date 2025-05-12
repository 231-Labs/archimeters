import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0xe7d3ca646b242748e6be8edfe5661ec776360d189c67cb79ea3a0b7457c9fcd4';
export const STATE_ID = '0xd02c9bbc116c10cbf19939d7a76d4d6a34681c5c3f7a409ba8eac402a8dd51d4';
export const ATELIER_STATE_ID = '0x8b52f145ca20f677ee6b6c64cd8e70f0f31120800e78b3f86dd5ae6c671bd5d6';
export const MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`;
export const SUI_CLOCK = '0x6';

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
  payment: string,
  clock: string = '0x6',
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::sculpt::mint_sculpt`,
    arguments: [
      tx.object(artlierId),
      tx.object(membershipId),
      tx.pure(bcs.string().serialize(alias).toBytes()),
      tx.pure(bcs.string().serialize(blueprint).toBytes()),
      tx.pure(bcs.string().serialize(structure).toBytes()),
      tx.object(payment),
      tx.object(clock),
    ],
  });
  return tx;
};

// TODO: Test this
export const printSculpt = async (
  sculptId: string,
  clock: string = SUI_CLOCK,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::sculpt::print_sculpt`,
    arguments: [
      tx.object(sculptId),
      tx.object(clock),
    ],
  });
  return tx;
}

// TODO: test this and implement to frontend
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
