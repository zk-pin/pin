import * as ed from "@noble/ed25519";

export const generateNewKeyPairHex = () => {
    const privateKey = ed.utils.randomPrivateKey();
    return "0x" + Buffer.from(privateKey).toString("hex");
};

export const generateNewKeyPairBigInt = () => {
    return BigInt(generateNewKeyPairHex());
};
