export type CommitmentPoolProps = {
  id: string;
  title: string;
  created_at: string;
  operatorId: string | number;
  operator: IOperator;
  description?: string;
  threshold: number;
  signatures: any[];
  revealedPublicKeys: any[];
  serializedPublicKeys: string[];
};

export type IOperator = {
  id: string | number;
  operator_key: string;
};

export type SerializedKeyPair = {
  privateKey: string;
  publicKey: string;
};

export interface ProofInput {
  poolPubKey: string[];
  merkleRoot: string;
  msg: string;
  ciphertext: string[];
  signerPrivKeyHash: string;
  signerPubKey: string[];
  pathElements: string[];
  pathIndices: string[];
}

export type VKeyRespData = {
  vkey: string;
};

export type ISignature = {
  ciphertext: string[];
  commitment_poolId: string | number;
};

/** for Dexie */
import Dexie from "dexie";
export class DexieDatabase extends Dexie {
  commitmentPools!: Dexie.Table<ICommitmentPools, number>;
  signers!: Dexie.Table<ISigner, number>;

  constructor() {
    super("zkPIN");

    this.version(1).stores({
      commitmentPools: "&commitmentPoolId",
      signers: "&userId",
    });
  }
}

// By defining the interface of table records,
// you get better type safety and code completion

// store commitment pool data client side
export type ICommitmentPools = {
  commitmentPoolId: string; // primary key
  operatorId: string | number;
  operatorPublicKey: string;
  operatorUserId: string; // store operator user id on client side for convenience
  localSigners: IPoolSigner[];
  operatorPrivateKey?: string;
};

// store pool signer data on client side
export type IPoolSigner = {
  publicKey: string;
};

// store user and key pair data on client side
export type ISigner = {
  userId: string;
  publicKey: string;
  privateKey: string;
};
