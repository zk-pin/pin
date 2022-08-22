import MerkleTree from "fixed-merkle-tree";
import { mimcHash } from "./mimc";

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
    const XArr = bigIntToArray(64, 4, BigInt("0x" + pk.slice(4, 4 + 64))).map((el) => el.toString());
    const YArr = bigIntToArray(64, 4, BigInt("0x" + pk.slice(68, 68 + 64))).map((el) => el.toString());

    return [XArr, YArr];
}

//merkle tree of list of "sybil-proof" public keys - leaves are the Mimc hash of Eddsa public keys (split into an array of
//2 elements to be compatible with construction in the snark), so we need to convert leafPublicKeys into that
export function createMerkleTree(currReaderAddr: string, leafPublicKeys: string[]) {
    //Yes the @ts-ignores are not ideal but unfortunately they're necessary because
    //the type definitions do not support bigints
    //@ts-ignore

    const formattedHashedAddrs: string[] = [];
    for (const pubKey of leafPublicKeys) {
        //do stuff
    }

    const tree = new MerkleTree(
        30,
        //@ts-ignore
        leafAddrs.map((el) => BigInt(el)),
        //@ts-ignore
        { hashFunction: mimcHash(123) }
    );

    //@ts-ignore
    const path = tree.proof(BigInt(currReaderAddr));
    return path;
}

export function sigToRSArrays(sig: string) {
    const rArr = bigIntToArray(64, 4, BigInt("0x" + sig.slice(2, 2 + 64))).map((el) => el.toString());
    const sArr = bigIntToArray(64, 4, BigInt("0x" + sig.slice(66, 66 + 64))).map((el) => el.toString());
    return [rArr, sArr];
}
