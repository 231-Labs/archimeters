import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0x8e3ec1c04ffa32baa2053d29b6eec37449eaa38a7acc800660de52a6dd088a97';
export const STATE_ID = '0x463f3fc95167229db0ec78c1aa30e9ac485b69e8d7508d30f3a79757f715a445';

export const mintMembership = async (username: string) => {
  // console.log('mintOS params:', username);
  
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::archimeters::mint_membership`,
    arguments: [
      tx.object(STATE_ID),
      tx.pure(bcs.string().serialize(username).toBytes()),
    ],
  });
  return tx;
};

export const createDesignSeries = async (
  membershipId: string,
  photo: string,
  website: string,
  algorithm: string,
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::design_series::mint`,
    arguments: [
      tx.object(membershipId),
      tx.pure(bcs.string().serialize(photo).toBytes()),
      tx.pure(bcs.string().serialize(website).toBytes()),
      tx.pure(bcs.string().serialize(algorithm).toBytes()),
    ],
  });
  return tx;
};