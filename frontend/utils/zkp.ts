import axios from "axios";
import MerkleTree from "fixed-merkle-tree";
import { mimcHash, mimcSponge } from "./mimc";
import { ProofInput, VKeyRespData } from "./types";

export function bigIntToArray(n: number, k: number, x: bigint) {
  let divisor = BigInt(1);
  for (var idx = 0; idx < n; idx++) {
    divisor = divisor * BigInt(2);
  }

  let ret = [];
  var x_temp = BigInt(x);
  for (var idx = 0; idx < k; idx++) {
    ret.push(x_temp % divisor);
    x_temp = x_temp / divisor;
  }
  return ret;
}

// taken from generation code in dizkus-circuits tests
export function pubkeyToXYArrays(pk: string) {
  const XArr = bigIntToArray(64, 4, BigInt("0x" + pk.slice(4, 4 + 64))).map(
    (el) => el.toString()
  );
  const YArr = bigIntToArray(64, 4, BigInt("0x" + pk.slice(68, 68 + 64))).map(
    (el) => el.toString()
  );

  return [XArr, YArr];
}

//input: list of public keys stored as hex
//merkle tree of list of "sybil-proof" public keys - leaves are the Mimc hash of Eddsa public keys (split into an array of
//2 elements to be compatible with construction in the snark), so we need to convert leafPublicKeys into that
export function createMerkleTree(
  currPublicKey: BigInt[],
  leafPublicKeys: BigInt[][]
) {
  console.log("formatted: ", hashBigIntArr(currPublicKey));
  // console.log("currPublicKey: ", currPublicKey);
  // console.log("leafPublicKeys: ", leafPublicKeys);
  //Yes the @ts-ignores are not ideal but unfortunately they're necessary because
  //the type definitions do not support bigints
  //@ts-ignore
  const formattedHashedAddrs: bigint[] = [];
  for (const pubKey of leafPublicKeys) {
    formattedHashedAddrs.push(hashBigIntArr(pubKey));
  }
  const formattedLeafPubKey = hashBigIntArr(currPublicKey);
  formattedHashedAddrs.push(formattedLeafPubKey);

  const tree = new MerkleTree(
    30,
    //@ts-ignore
    formattedHashedAddrs,
    //@ts-ignore
    { hashFunction: mimcHash(123) }
  );

  //@ts-ignore
  const path = tree.proof(formattedLeafPubKey);
  return path;
}

export const generateProof = async (input: ProofInput) => {
  // @ts-ignore TODO:
  return await snarkjs.groth16.fullProve(input, "/main.wasm", "/main.zkey");
};

export const verifyProof = async (proof: JSON, publicSignals: JSON) => {
  const vkey = await getVKeys();
  // @ts-ignore TODO:
  const verifiedProof = await snarkjs.groth16.verify(
    vkey,
    publicSignals,
    proof
  );
  return verifiedProof;
};

async function getVKeys(): Promise<JSON> {
  const vkey = JSON.parse(
    await (
      await axios.get<VKeyRespData>("/api/getVKey")
    ).data.vkey
  );
  return vkey;
}

export function sigToRSArrays(sig: string) {
  const rArr = bigIntToArray(64, 4, BigInt("0x" + sig.slice(2, 2 + 64))).map(
    (el) => el.toString()
  );
  const sArr = bigIntToArray(64, 4, BigInt("0x" + sig.slice(66, 66 + 64))).map(
    (el) => el.toString()
  );
  return [rArr, sArr];
}

export const formatPubKeyHex = (hexPubKey: string) => {
  let arrPubKey: bigint[] = [];
  if (typeof hexPubKey === "string") {
    arrPubKey = bigIntToArray(32, 2, BigInt(hexPubKey));
  }
  //TODO
};

//given hex public key or BigInt[2], computes similar-style hash to circom equivalent
export const hashBigIntArr = (pubKey: BigInt[]) => {
  //@ts-ignore
  return BigInt(mimcSponge(pubKey, 1, 220, 123)[0].toString());
};
