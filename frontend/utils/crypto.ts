//Much of this was ported from https://github.com/privacy-scaling-explorations/maci/blob/master/crypto/ts/index.ts

import * as circomlibjs from "circomlibjs";
import * as crypto from "crypto";
const ff = require("ffjavascript");
const createBlakeHash = require("blake-hash");
import assert from "assert";
import { createMerkleTree, hashBigIntArr } from "./zkp";
import { Keypair, PrivKey, PubKey } from "maci-domainobjs";
import { encrypt, decrypt } from "maci-crypto";
import {
  IDecryptedSigners,
  ISignature,
  ProofInput,
  SerializedKeyPair,
} from "./types";

export const DELIMETER = "%--%";

export const serializePubKey = (keyPair: Keypair): string => {
  return (
    keyPair.pubKey.rawPubKey[0].toString() +
    DELIMETER +
    keyPair.pubKey.rawPubKey[1].toString()
  );
};

export const deserializePubKey = (serializedPubKey: string): BigInt[] => {
  const splitString = serializedPubKey.split(DELIMETER);
  return [BigInt(splitString[0]), BigInt(splitString[1])];
};

export const generatePrivKey = () => {
  return new Keypair().privKey.rawPrivKey.toString();
};

// required for front-end
// DO NOT DELETE
// Note generateNewKeyPair returns a serializedPublicKey representation of the BigInt keys
// privateKey: String(privKey)
// publicKey: String(publicKey[0]) + "%--%" + String(publicKey[1])
export const generateNewKeyPair = (): SerializedKeyPair => {
  const pair = genKeypair();
  return {
    privateKey: pair.privKey.rawPrivKey.toString(),
    publicKey: serializePubKey(pair),
  };
};

export const getPublicKeyFromPrivate = async (privKey: string) => {
  return serializePubKey(new Keypair(new PrivKey(BigInt(privKey))));
};

// @ts-ignore TODO:
let eddsa: any;

interface Ciphertext {
  // The initialisation vector
  iv: BigInt;

  // The encrypted data
  data: BigInt[];
}

interface KeypairHex {
  privKey: string;
  pubKey: string;
}

const SNARK_FIELD_SIZE = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

/*
 * Returns a BabyJub-compatible random value. We create it by first generating
 * a random value (initially 256 bits large) modulo the snark field size as
 * described in EIP197. This results in a key size of roughly 253 bits and no
 * more than 254 bits. To prevent modulo bias, we then use this efficient
 * algorithm:
 * http://cvsweb.openbsd.org/cgi-bin/cvsweb/~checkout~/src/lib/libc/crypt/arc4random_uniform.c
 * @return A BabyJub-compatible random value.
 */
const genRandomBabyJubValue = (): BigInt => {
  // Prevent modulo bias
  //const lim = BigInt('0x10000000000000000000000000000000000000000000000000000000000000000')
  //const min = (lim - SNARK_FIELD_SIZE) % SNARK_FIELD_SIZE
  const min = BigInt(
    "6350874878119819312338956282401532410528162663560392320966563075034087161851"
  );

  let rand;
  while (true) {
    rand = BigInt("0x" + crypto.randomBytes(32).toString("hex"));

    if (rand >= min) {
      break;
    }
  }

  const privKey: BigInt = rand % SNARK_FIELD_SIZE;
  assert(privKey < SNARK_FIELD_SIZE);

  return privKey;
};

export const genPrivKey = () => {
  return genRandomBabyJubValue();
};

const bigIntToHex = (i: BigInt): string => {
  return bigInt2Buffer(i).toString("hex");
};

/*
 * Convert a BigInt to a Buffer
 */
const bigInt2Buffer = (i: BigInt): Buffer => {
  let hexStr = i.toString(16);
  while (hexStr.length < 64) {
    hexStr = "0" + hexStr;
  }
  return Buffer.from(hexStr, "hex");
};

const loadEddsa = async () => {
  if (!eddsa) {
    eddsa = await circomlibjs.buildEddsa();
  }
  return eddsa;
};

export const genKeypair = (): Keypair => {
  return new Keypair();
};

export function uint8ArrToBigInt(uint8a: Uint8Array): bigint {
  if (!(uint8a instanceof Uint8Array)) throw new Error("Expected Uint8Array");
  return BigInt("0x" + bytesToHex(Uint8Array.from(uint8a)));
}

function bytesToHex(uint8a: Uint8Array): string {
  // pre-caching chars could speed this up 6x.
  let hex = "";
  for (let i = 0; i < uint8a.length; i++) {
    hex += hexes[uint8a[i]];
  }
  return hex;
}

const hexes = Array.from({ length: 256 }, (v, i) =>
  i.toString(16).padStart(2, "0")
);

/*
 * An internal function which formats a random private key to be compatible
 * with the BabyJub curve. This is the format which should be passed into the
 * PublicKey and other circuits.
 */
const formatPrivKeyForBabyJub = async (privKey: BigInt) => {
  await loadEddsa();
  const sBuff = eddsa.pruneBuffer(
    createBlakeHash("blake512")
      .update(bigInt2Buffer(privKey))
      .digest()
      .slice(0, 32)
  );
  const s = ff.utils.leBuff2int(sBuff);
  return ff.Scalar.shr(s, 3);
};

export const generateCircuitInputs = async (
  serializedOpPubKey: string,
  serializedSignerPrivKey: string,
  sybilPubKeys: string[],
  committmentPoolId: number
): Promise<ProofInput> => {
  const signer = new Keypair(new PrivKey(BigInt(serializedSignerPrivKey)));
  const deserializedOpPubKey = deserializePubKey(serializedOpPubKey);

  const globalPubkeyPool = sybilPubKeys.map((el) => deserializePubKey(el));

  const sharedSecret = Keypair.genEcdhSharedKey(
    signer.privKey,
    new PubKey(deserializedOpPubKey)
  );

  const plaintext: any[] = [BigInt(committmentPoolId)];

  const ciphertext = await encrypt(plaintext, sharedSecret);
  const decryptedCiphertext = await decrypt(ciphertext, sharedSecret);

  const merkle = createMerkleTree(signer.pubKey.rawPubKey, globalPubkeyPool);
  const res = await prepareInputs(
    deserializedOpPubKey,
    signer.pubKey.rawPubKey,
    signer.privKey.rawPrivKey,
    ciphertext
  );
  return {
    msg: BigInt(committmentPoolId).toString(),
    merkleRoot: merkle.pathRoot.toString(),
    pathElements: merkle.pathElements.map((el) => el.toString()),
    pathIndices: merkle.pathIndices.map((el) => el.toString()),
    ...res,
  };
};

// decrypts cipher texts with public key set
export const decryptCipherTexts = (
  operatorPrivateKeyString: string,
  serializedPublicKeys: string[],
  signatures: ISignature[],
  commitmentPoolId: number
) => {
  const operatorPrivateKey = new PrivKey(BigInt(operatorPrivateKeyString));
  const revealedSigners: IDecryptedSigners[] = [];
  const serializedPublicKeySet = new Set(serializedPublicKeys);
  signatures.forEach((signature) => {
    const cipherText = {
      iv: BigInt(signature.ciphertext[0]),
      data: signature.ciphertext.slice(1).map((cp) => BigInt(cp)),
    };

    serializedPublicKeySet.forEach((serializedPubKey) => {
      console.log("attempting with key: ", serializedPubKey);
      const tempPubKey = new PubKey(deserializePubKey(serializedPubKey));
      const sharedSecret = Keypair.genEcdhSharedKey(
        operatorPrivateKey,
        tempPubKey
      );

      const decryptAttempt = decrypt(cipherText, sharedSecret);
      if (Number(decryptAttempt[0]) === commitmentPoolId) {
        revealedSigners.push({
          serializedPubKey,
          ipfsHash: signature.ipfs.ipfsHash,
        });
      }
    });
  });
  return revealedSigners;
};

const prepareInputs = async (
  opPubkey: BigInt[],
  signerPubkey: BigInt[],
  signerPrivKey: BigInt,
  ciphertext: Ciphertext
) => {
  return {
    poolPubKey: opPubkey.map((el) => el.toString()),
    signerPubKey: signerPubkey.map((el) => el.toString()),
    ciphertext: [
      ciphertext.iv.toString(),
      ...ciphertext.data.map((el) => el.toString()),
    ],
    ciphertextHash: hashBigIntArr([
      ciphertext.iv,
      ...ciphertext.data,
    ]).toString(),
    signerPrivKeyHash: (
      await formatPrivKeyForBabyJub(signerPrivKey)
    ).toString(),
  };
};

export async function testCircuit() {
  const signer = genKeypair();

  const operator = genKeypair();

  const publicKeyLeaves: BigInt[][] = [];
  for (let i = 0; i < 5; i++) {
    publicKeyLeaves.push(genKeypair().pubKey.rawPubKey);
  }
  publicKeyLeaves.push(signer.pubKey.rawPubKey);

  const sharedSecret = Keypair.genEcdhSharedKey(
    signer.privKey,
    operator.pubKey
  );

  const plaintext: any[] = [BigInt(1)];

  const ciphertext = await encrypt(plaintext, sharedSecret);

  const decryptedCiphertext = await decrypt(
    ciphertext,
    Keypair.genEcdhSharedKey(operator.privKey, signer.pubKey)
  );

  console.log("cyper: ", plaintext, " deciphered: ", decryptedCiphertext);

  const res = await prepareInputs(
    operator.pubKey.rawPubKey,
    signer.pubKey.rawPubKey,
    signer.privKey.rawPrivKey,
    ciphertext
  );

  const merkle = createMerkleTree(signer.pubKey.rawPubKey, publicKeyLeaves);

  const finalRes = {
    msg: BigInt(1).toString(),
    merkleRoot: merkle.pathRoot.toString(),
    pathElements: merkle.pathElements.map((el) => el.toString()),
    pathIndices: merkle.pathIndices.map((el) => el.toString()),
    ...res,
  };
  console.log(JSONStringifyCustom(finalRes));
  return finalRes;
}

export function JSONStringifyCustom(val: any) {
  return JSON.stringify(
    val,
    (_, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
  );
}
