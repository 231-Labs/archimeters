import { bcs } from "@mysten/sui/bcs";
import { Transaction as TX } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0x80d49eb9fd5553ed959bbf6a8ba4fa96fefc481a79abb9a4214f2010c169b5cc';
export const STATE_ID = '0x0f636eeb4859365681f415ec3654e83beeae957f3e4cb49ba47863c347ee4c6d';

export const mintMembership = async (username: string) => {
  console.log('mintOS params:', username);
  
  const tx = new TX();
  tx.moveCall({
    target: `${PACKAGE_ID}::archimeters::mint_membership`,  // TODO: change to actual function call
    arguments: [
      tx.object(STATE_ID),
      tx.pure(bcs.string().serialize(username).toBytes()),
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