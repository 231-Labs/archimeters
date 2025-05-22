import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";

export const PACKAGE_ID = '0x81eac9c2b1857eb78af2453a46ea405ab3596a8101f1980bfa9b7600e576d801';
export const EUREKA_PACKAGE_ID = '0x81eac9c2b1857eb78af2453a46ea405ab3596a8101f1980bfa9b7600e576d801'
export const STATE_ID = '0x2eaabd6dc4823c0b25814900f80b6fa7316121b61388f4612b19693e6e57dc04';
export const ATELIER_STATE_ID = '0x1ceea8b915572a3047ae7734304ddc5beba0d2bfed06ad69e19bf9aa9e802b2e';
export const PRINTER_REGISTRY = `0x5b4c3ead9cc63796f0933cec5f222c4c6d8450b3190f1ba29fa8f0b1c3d1a693`;
export const MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`;
export const SUI_CLOCK = '0x6';
export const MIST_PER_SUI = 1_000_000_000;

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
  clock: string = '0x6',
) => {
  const tx = new Transaction();
  
  // Instead of creating a separate coin and having ownership issues,
  // use tx.gas directly and let the contract handle the splitting
  tx.moveCall({
    target: `${PACKAGE_ID}::sculpt::mint_sculpt`,
    arguments: [
      tx.object(artlierId),
      tx.object(membershipId),
      tx.pure(bcs.string().serialize(alias).toBytes()),
      tx.pure(bcs.string().serialize(blueprint).toBytes()),
      tx.pure(bcs.string().serialize(structure).toBytes()),
      tx.gas, // Use gas coin directly
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