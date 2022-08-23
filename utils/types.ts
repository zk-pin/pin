export type CommitmentPoolProps = {
  id: string;
  title: string;
  created_at: string;
  operatorId: string | number;
  description?: string;
  threshold: number;
  signatures: any[];
  revealed_keys: any[];
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

/** for Dexie */
import Dexie from "dexie";
export class DexieDatabase extends Dexie {
    commitmentPools!: Dexie.Table<ICommitmentPools, number>;

    constructor() {
        super("zkPIN");

        this.version(1).stores({
            commitmentPools: "&commitmentPoolId",
        });
    }
}

// By defining the interface of table records,
// you get better type safety and code completion
export type ICommitmentPools = {
    commitmentPoolId: string; // primary key
    operatorId: string | number;
    operatorPublicKey: string;
    signers: ISigner[];
};

export type ISigner = {
    publicKey: string;
};
