//Much of this was ported from https://github.com/privacy-scaling-explorations/maci/blob/master/crypto/ts/index.ts

import * as ed from "@noble/ed25519";
import * as circomlibjs from "circomlibjs";
import * as crypto from "crypto";
import assert from "assert";
import { createMerkleTree } from "./zkp";

export const generateNewKeyPairHex = () => {
    const privateKey = ed.utils.randomPrivateKey();
    return "0x" + Buffer.from(privateKey).toString("hex");
};

//@ts-ignore
let eddsa: any;

type PrivKey = BigInt;
type PubKey = BigInt[];
type EcdhSharedKey = BigInt;
type Plaintext = BigInt[];

interface Ciphertext {
    // The initialisation vector
    iv: BigInt;

    // The encrypted data
    data: BigInt[];
}

interface Keypair {
    privKey: PrivKey;
    pubKey: PubKey;
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

    const privKey: PrivKey = rand % SNARK_FIELD_SIZE;
    assert(privKey < SNARK_FIELD_SIZE);

    return privKey;
};

export const genPrivKey = () => {
    return genRandomBabyJubValue();
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

/*
 * @param privKey A private key generated using genPrivKey()
 * @return A public key associated with the private key
 */
const genPubKey = async (privKey: PrivKey): Promise<PubKey> => {
    privKey = BigInt(privKey.toString());
    assert(privKey < SNARK_FIELD_SIZE);
    await loadEddsa();
    return eddsa.prv2pub(bigInt2Buffer(privKey));
};

export const genKeypair = async (): Promise<Keypair> => {
    const privKey = genPrivKey();
    const pubKey = await genPubKey(privKey);

    const keypair: Keypair = { privKey, pubKey };

    return keypair;
};

export const genKeypairHex = async (): Promise<KeypairHex> => {
    const keypair = await genKeypair();
    return {
        privKey: bigInt2Buffer(keypair.privKey).toString("hex"),
        pubKey: bigInt2Buffer(keypair.privKey).toString("hex"),
    };
};

const encrypt = async (
    plaintext: Plaintext,
    sharedKey: EcdhSharedKey
): Promise<Ciphertext> => {
    await loadEddsa();
    // Generate the IV
    const iv = eddsa.mimc7.multiHash(plaintext, BigInt(0));

    const ciphertext: Ciphertext = {
        iv,
        data: plaintext.map((e: BigInt, i: number): BigInt => {
            return e + eddsa.mimc7.hash(sharedKey, iv + BigInt(i));
        }),
    };

    // TODO: add asserts here
    return ciphertext;
};

/*
 * Decrypts a ciphertext using a given key.
 * @return The plaintext.
 */
const decrypt = async (
    ciphertext: Ciphertext,
    sharedKey: EcdhSharedKey
): Promise<Plaintext> => {
    await loadEddsa();
    const plaintext: Plaintext = ciphertext.data.map(
        (e: BigInt, i: number): BigInt => {
            return (
                (e as bigint) -
                BigInt(
                    eddsa.mimc7.hash(
                        sharedKey,
                        (ciphertext.iv as bigint) + BigInt(i)
                    )
                )
            );
        }
    );

    return plaintext;
};

// export async function testCircuit() {
//     const signer = await genKeypair();

//     const operator = await genKeypair();

//     const publicKeyLeaves: string[] = [];
//     for (let i = 0; i < 5; i++) {
//         publicKeyLeaves.push((await genKeypair()).pubKey);
//     }
//     publicKeyLeaves.push(signer.publicKey);

//     const sharedSecret = ed.getSharedSecret(
//         operator.publicKey,
//         signer.privateKey
//     );

//     console.log("poolPubKey: ", operator.publicKey);
//     console.log("msg: ");

//     console.log(
//         JSONStringifyCustom(createMerkleTree(signer.publicKey, publicKeyLeaves))
//     );
// }

export function JSONStringifyCustom(val: any) {
    return JSON.stringify(
        val,
        (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
    );
}
