//Much of this was ported from https://github.com/privacy-scaling-explorations/maci/blob/master/crypto/ts/index.ts

import * as circomlibjs from "circomlibjs";
import * as crypto from "crypto";
const ff = require("ffjavascript");
const createBlakeHash = require("blake-hash");
import assert from "assert";
import { createMerkleTree, formatPubKey } from "./zkp";
import { Keypair } from "maci-domainobjs";
import { encrypt, decrypt } from "maci-crypto";

// required for front-end
// DO NOT DELETE
export const generateNewKeyPair = async () => {
    const privateKey = ed.utils.randomPrivateKey();
    const privateKeyAsHex = "0x" + Buffer.from(privateKey).toString("hex");
    const publicKey = await ed.getPublicKey(privateKey);
    const publicKeyAsHex = "0x" + Buffer.from(publicKey).toString("hex");
    return {
        privateKey: privateKeyAsHex,
        publicKey: publicKeyAsHex,
    };
};

export const getPublicKeyFromPrivate = async (privKey: string) => {
    const privateKeyBytes = Uint8Array.from(
        Buffer.from(privKey.slice(2), "hex")
    );
    const publicKey = await ed.getPublicKey(privateKeyBytes);
    return "0x" + Buffer.from(publicKey).toString("hex");
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

export const testBroken = async () => {
    await loadEddsa();
    console.log("HELLO");
    const plaintext = [BigInt(31), BigInt(12)];
    const sharedKey =
        BigInt(
            17708171275687628017204240208069223834215068267368546344451334093183644322044
        );
    const ciphertext = await encrypt(plaintext, sharedKey);
    const decrypted = await decrypt(ciphertext, sharedKey);
    console.log("ciphertext: ", ciphertext, " decrypted: ", decrypted);
    console.log("HELLO");
};

/*
 * @param privKey A private key generated using genPrivKey()
 * @return A public key associated with the private key
 */
// const genPubKey = async (privKey: PrivKey): Promise<PubKey> => {
//     privKey = BigInt(privKey.toString());
//     assert(privKey < SNARK_FIELD_SIZE);
//     await loadEddsa();
//     return eddsa.prv2pub(bigInt2Buffer(privKey));
// };

export const genKeypair = (): Keypair => {
    return new Keypair();
};

// export const genKeypairHex = async (): Promise<KeypairHex> => {
//     const keypair = await genKeypair();
//     return {
//         privKey: bigInt2Buffer(keypair.privKey).toString("hex"),
//         pubKey: bigInt2Buffer(keypair.privKey).toString("hex"),
//     };
// };

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

// const encrypt = async (
//     plaintext: Plaintext,
//     sharedKey: EcdhSharedKey
// ): Promise<Ciphertext> => {
//     await loadEddsa();
//     // Generate the IV
//     const iv = uint8ArrToBigInt(eddsa.mimc7.multiHash(plaintext, BigInt(0)));
//     const ciphertext: Ciphertext = {
//         iv,
//         data: plaintext.map((e: BigInt, i: number): BigInt => {
//             return (
//                 BigInt(e) +
//                 uint8ArrToBigInt(eddsa.mimc7.hash(sharedKey, iv + BigInt(i)))
//             );
//         }),
//     };

//     // TODO: add asserts here
//     return ciphertext;
// };

/*
 * Decrypts a ciphertext using a given key.
 * @return The plaintext.
 */
// const decrypt = async (
//     ciphertext: Ciphertext,
//     sharedKey: EcdhSharedKey
// ): Promise<Plaintext> => {
//     await loadEddsa();
//     const plaintext: Plaintext = ciphertext.data.map(
//         (e: BigInt, i: number): BigInt => {
//             return (
//                 //@ts-ignore
//                 BigInt(e) -
//                 //@ts-ignore
//                 uint8ArrToBigInt(
//                     eddsa.mimc7.hash(
//                         sharedKey,
//                         //@ts-ignore
//                         BigInt(ciphertext.iv) + BigInt(i)
//                     )
//                 )
//             );
//         }
//     );

//     return plaintext;
// };

/*
 * Generates an Elliptic-curve Diffie–Hellman shared key given a private key
 * and a public key.
 * @return The ECDH shared key.
 */
// const genEcdhSharedKey = async (
//     privKey: PrivKey,
//     pubKey: PubKey
// ): Promise<EcdhSharedKey> => {
//     await loadEddsa();
//     return await eddsa.babyJub.mulPointEscalar(
//         pubKey,
//         formatPrivKeyForBabyJub(privKey)
//     )[0];
// };

/*
 * An internal function which formats a random private key to be compatible
 * with the BabyJub curve. This is the format which should be passed into the
 * PublicKey and other circuits.
 */
const formatPrivKeyForBabyJub = async (privKey: PrivKey) => {
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

const prepareInputs = async (
    opPubkey: BigInt[],
    signerPubkey: BigInt[],
    signerPrivKey: BigInt,
    ciphertext: Ciphertext
) => {
    return {
        poolPubKey: opPubkey,
        signerPubKey: signerPubkey,
        ciphertext: [ciphertext.iv, ...ciphertext.data],
        signerPrivKeyHash: await formatPrivKeyForBabyJub(signerPrivKey),
    };
};

export async function testCircuit() {
    const signer = genKeypair();

    const operator = genKeypair();

    const publicKeyLeaves: PubKey[] = [];
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
    // const decryptedCiphertext = await decrypt(ciphertext, sharedSecret);
    // console.log("cyper: ", plaintext, " deciphered: ", decryptedCiphertext);

    const res = await prepareInputs(
        operator.pubKey.rawPubKey,
        signer.pubKey.rawPubKey,
        signer.privKey.rawPrivKey,
        ciphertext
    );
    console.log("NEW SET!!!");
    console.log(
        JSONStringifyCustom(
            createMerkleTree(signer.pubKey.rawPubKey, publicKeyLeaves)
        )
    );
    console.log("sharedSecret: ", sharedSecret);
    console.log(JSONStringifyCustom(res));

    return res;
}

export function JSONStringifyCustom(val: any) {
    return JSON.stringify(
        val,
        (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
    );
}
