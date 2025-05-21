import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0xae7f452d2cfe4ecb13be83d67cf706d4219aca0becf26fb3fb9d999e489d0ec4';
export const EUREKA_PACKAGE_ID = '0xae7f452d2cfe4ecb13be83d67cf706d4219aca0becf26fb3fb9d999e489d0ec4'
export const STATE_ID = '0xa1e659b7fcfac5029cc53854c3ae2edb5623b345463343f1619f8b59537c1231';
export const ATELIER_STATE_ID = '0xcb52d65a3d600ea300bc4824444fdda7ab82ff3595195114f5e1988ce8bc081f';
export const PRINTER_REGISTRY = `0xe2a996f1ea846d58304d2e7f3e17c2c744db7482fbcb7635be202a20c916f36c`;
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
  price: string,
  clock: string = '0x6',
) => {
  const tx = new Transaction();
  
  // 從用戶錢包中找到一個 coin 並直接傳遞
  // 這樣合約可以將費用從這個 coin 中提取並將剩餘部分返回
  const coinToUse = tx.gas; // 使用 gas coin 作為支付來源
  
  tx.moveCall({
    target: `${PACKAGE_ID}::sculpt::mint_sculpt`,
    arguments: [
      tx.object(artlierId),
      tx.object(membershipId),
      tx.pure(bcs.string().serialize(alias).toBytes()),
      tx.pure(bcs.string().serialize(blueprint).toBytes()),
      tx.pure(bcs.string().serialize(structure).toBytes()),
      coinToUse, // 直接傳遞 gas coin 的引用
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