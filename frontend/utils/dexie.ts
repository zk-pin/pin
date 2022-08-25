// dexie.ts
import { DexieDatabase, ISigner } from "@utils/types";

export const cache = new DexieDatabase();

export async function addOperatorDataToCache(
  commitmentPoolId: string,
  operatorPublicKey: string,
  operatorId: string,
  operatorUserId: string,
  operatorPrivateKey?: string
) {
  try {
    let pool = await cache.commitmentPools.get({
      commitmentPoolId: commitmentPoolId,
    });

    if (!pool) {
      await cache.commitmentPools.add({
        commitmentPoolId: commitmentPoolId,
        operatorPublicKey: operatorPublicKey,
        operatorId: operatorId,
        operatorUserId: operatorUserId,
        operatorPrivateKey: operatorPrivateKey,
        localSigners: [],
      });
    }
  } catch (error) {
    console.log(`Failed to add ${commitmentPoolId}: ${error}`);
  }
}

export async function addSignerDataToCommitmentPoolInCache(
  commitmentPoolId: string,
  signerPubKey: string
) {
  try {
    const pool = await cache.commitmentPools
      .where("commitmentPoolId")
      .equals(commitmentPoolId)
      .first();
    if (!pool) {
      await cache.commitmentPools.add({
        commitmentPoolId: commitmentPoolId,
        operatorPublicKey: "",
        operatorId: "",
        operatorUserId: "",
        localSigners: [{ publicKey: signerPubKey }],
      });
    } else {
      await cache.commitmentPools
        .where("commitmentPoolId")
        .equals(commitmentPoolId)
        .modify((entry) => {
          entry.localSigners.push({ publicKey: signerPubKey });
        });
    }
  } catch (error) {
    console.log(`Failed to add signer to ${commitmentPoolId}: ${error}`);
    return undefined;
  }
}

export async function getCachedCommitmentPoolData(commitmentPoolId: string) {
  try {
    let pool = await cache.commitmentPools.get({
      commitmentPoolId: commitmentPoolId,
    });

    return pool;
  } catch (error) {
    console.log(`Failed to get ${commitmentPoolId}: ${error}`);
    return undefined;
  }
}

export async function getCachedSignerData(userId: string) {
  try {
    let signers = await cache.signers.get({
      userId: userId,
    });

    return signers;
  } catch (error) {
    console.log(`Failed to get ${userId}: ${error}`);
    return undefined;
  }
}

export async function addSignerDataToCache(
  userId: string,
  pubKey: string,
  privKey: string
) {
  try {
    let signer = await cache.signers.get({
      userId: userId,
    });

    if (!signer) {
      await cache.signers.add({
        userId,
        privateKey: privKey,
        publicKey: pubKey,
      });
    }
  } catch (error) {
    console.log(`Failed to add ${userId} to signers list s: ${error}`);
  }
}
