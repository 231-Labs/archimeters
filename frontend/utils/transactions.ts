import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0x7b0fc033d2081d746358b47ada123556ff4d9660a0dc73e4cd23e54f6b628c97';
export const EUREKA_PACKAGE_ID = '0x7b0fc033d2081d746358b47ada123556ff4d9660a0dc73e4cd23e54f6b628c97'
export const STATE_ID = '0x0ed851c11451de278aeb8b31c253f29f32f361c814f69d631b1d5ca69f11e0b9';
export const ATELIER_STATE_ID = '0x65d70e23c92f0e0ee2c3c94b88589b4d77836f4626ac3188728394ca98ce3778';
export const PRINTER_REGISTRY = `0xeb1fb35aacdbce1f9f14e9c991a917a2c532c512ded4bbae7d119f6d3ada1265`;
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