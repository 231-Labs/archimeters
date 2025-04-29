import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0x6746cdfc93c969e0bbdf6325d2236620b859840b49584c5cefde1c545cf99e53';
export const STATE_ID = '0xd04e83ddb9b00fe26c7c74256b563c80f6ec538bbbe18427ecb41b2dd3ba9b9d';
export const ARTLIER_STATE_ID = '0x53a8aad48039095f3d56dcb6f976bf08609d27560d8e2432d316a73a7676bfbe';

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
    target: `${PACKAGE_ID}::artlier::mint_artlier`,
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