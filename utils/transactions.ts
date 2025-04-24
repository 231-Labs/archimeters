import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0xae378bc06204b33b235b9bb02c54fee089761e42a0c5b09e01f04eecd90ac7e9';
export const STATE_ID = '0x03e9918c9f0633b1a1447970f908312231259095483b018f190a18939fcee98c';
export const ARTLIER_STATE_ID = '0x61e379d23bb9a3baf6f1f8ed0bfe3fa7c659285024a3872bb69049d733f962be';

export const mintMembership = async (username: string) => {
  
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::archimeters::mint_membership`,
    arguments: [
      tx.object(STATE_ID),
      tx.pure(bcs.string().serialize(username).toBytes()),
      tx.object('0x6'),
    ],
  });
  return tx;
};

export const createDesignSeries = async (
  artlierState: string,
  membershipId: string,
  photo: string,
  data: string,
  algorithm: string,
  clock: string,
  price: number,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::design_series::mint_design_series`,
    arguments: [
      tx.object(artlierState),
      tx.object(membershipId),
      tx.pure(bcs.string().serialize(photo).toBytes()),
      tx.pure(bcs.string().serialize(data).toBytes()),
      tx.pure(bcs.string().serialize(algorithm).toBytes()),
      tx.object(clock),
      tx.pure(bcs.u64().serialize(price).toBytes()),
    ],
  });
  return tx;
};