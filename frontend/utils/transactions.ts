import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0xae1872684ba5684b43b2dd6a379819f943c68e9366c6c2f77faeb54d485ccc18';
export const EUREKA_PACKAGE_ID = '0xae1872684ba5684b43b2dd6a379819f943c68e9366c6c2f77faeb54d485ccc18'
export const STATE_ID = '0x6b0321ef3d599ddc288103dbbddd8a43f86975e8bae6dc0ab41571df04333e17';
export const ATELIER_STATE_ID = '0x129b1cffcfb7ca90835aeafcd073213a35580674c76af194b4797b61ec51dc7e';
export const MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`;
export const PRINTER_REGISTRY = `0x5403f201d1acf6a6d33ed9f0aa33cfcb1b76258d45d78b30cbe79dd19e61937c`;
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

// Function to print a sculpt with a specific printer
export const printSculpt = async (
  sculptId: string,
  clock: string = SUI_CLOCK,
  printerId?: string,
) => {
  const tx = new Transaction();
  
  // 如果提供了 printerId，則使用特定的打印機
  if (printerId) {
    tx.moveCall({
      target: `${PACKAGE_ID}::sculpt::print_sculpt_with_printer`,
      arguments: [
        tx.object(sculptId),
        tx.object(printerId),
        tx.object(clock),
      ],
    });
  } else {
    // 向後兼容的原始函數，沒有指定打印機
    tx.moveCall({
      target: `${PACKAGE_ID}::sculpt::print_sculpt`,
      arguments: [
        tx.object(sculptId),
        tx.object(clock),
      ],
    });
  }
  
  return tx;
}