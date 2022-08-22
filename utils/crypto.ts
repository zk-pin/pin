import * as ed from "@noble/ed25519";

export const generateNewKeyPairHex = () => {
    const privateKey = ed.utils.randomPrivateKey();
    return "0x" + Buffer.from(privateKey).toString("hex");
};

export const generateNewKeyPair = async () => {
    const privateKey = ed.utils.randomPrivateKey(); // raw bytes
    const privateKeyAsHex = "0x" + Buffer.from(privateKey).toString("hex");
    const publicKey = await ed.getPublicKey(privateKey);
    const publicKeyAsHex = "0x" + Buffer.from(publicKey).toString("hex");
    return { privateKey: privateKeyAsHex, publicKey: publicKeyAsHex };
};

export const generateNewKeyPairBigInt = () => {
    return BigInt(generateNewKeyPairHex());
};
