import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0xaf1c41bbbf35d77b6a1ce1a98147c6712cd5815fa6be08c74b39de83778f23af';
export const STATE_ID = '0x7b278f0c3e02ef806426bb066a71fd9958beac9bff7ab2f5a6fc3909de6febb0';
export const ARTLIER_STATE_ID = '0x4fb4b6750b86dd8c7ce2706ec19cfc2c76d2aee3a03ab7d469d7f5553fc207da';

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