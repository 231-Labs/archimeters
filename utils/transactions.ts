import { bcs } from "@mysten/sui/bcs";
import { Transaction as TX } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0x0';
export const STATE_ID = '0x0';

export const mintOS = async (username: string, settings_blob: string = "") => {
  console.log('mintOS params:', username, settings_blob);
  
  const tx = new TX();
  tx.moveCall({
    target: `${PACKAGE_ID}::artlier::mint_id`,  // TODO: change to actual function call
    arguments: [
      tx.object(STATE_ID),
      tx.pure(bcs.string().serialize(username).toBytes()),
      tx.pure(bcs.string().serialize(settings_blob).toBytes()),
    ],
  });
  return tx;
};

export const createArtlier = async (
  osId: string,
  name: string,
  blobId: string
) => {
  // console.log('create params:', { osId, name, blobId });
  
  const tx = new TX();
  tx.moveCall({
    target: `${PACKAGE_ID}::artlier::create_art`, // TODO: change to actual function call
    arguments: [
      tx.object(osId),
      tx.pure(bcs.string().serialize(name).toBytes()),
      tx.pure(bcs.string().serialize(blobId).toBytes()),
    ],
  });
  return tx;
};

export const createMoment = async (
  osId: string,
  title: string,
  description: string,
  date: string,
  blobId?: string
) => {
  const tx = new TX();
  tx.moveCall({
    target: `${PACKAGE_ID}::artlier::function_call`, // TODO: change to actual function call
    arguments: [
      tx.object(osId),
      tx.pure(bcs.string().serialize(title).toBytes()),
      tx.pure(bcs.string().serialize(description).toBytes()),
      tx.pure(blobId ? bcs.option(bcs.string()).serialize(blobId).toBytes() : bcs.option(bcs.string()).serialize(null).toBytes()),
      tx.pure(bcs.string().serialize(date).toBytes()),
    ],
  });
  return tx;
}; 