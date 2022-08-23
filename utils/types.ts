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
