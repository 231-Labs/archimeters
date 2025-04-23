import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0x8271c9b1dff31d66b0eda3955abfd79ad629e8097d68214034857054243e4414';
export const STATE_ID = '0x1e3bba394edf526162ec0b8671cad4f254808ca581f9cf827c5f7f9109138419';
export const ARTLIER_STATE_ID = '0xcbea0187697a22ba9a78dea328c64ad4332d46bfb1547ac04506bf2d4fda0769';

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