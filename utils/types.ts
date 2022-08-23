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
  poolPubKey: BigInt[];
  merkleRoot: BigInt;
  msg: BigInt;
  ciphertext: BigInt[];
  signerPrivKeyHash: BigInt;
  signerPubKey: BigInt[];
  pathElements: BigInt[];
  pathIndices: BigInt[];
}

export type VKeyRespData = {
  vkey: string;
};
