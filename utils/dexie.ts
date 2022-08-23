// dexie.ts
import { DexieDatabase, ISigner } from "@utils/types";

export const db = new DexieDatabase();

export async function addOperatorData(
    commitmentPoolId: string,
    operatorPublicKey: string,
    operatorId: string
) {
    try {
        let pool = await db.commitmentPools.get({
            commitmentPoolId: commitmentPoolId,
        });

        const signers = pool?.signers as ISigner[];

        if (!pool) {
            await db.commitmentPools.add({
                commitmentPoolId: commitmentPoolId,
                operatorPublicKey: operatorPublicKey,
                operatorId: operatorId,
                signers: signers,
            });
        }
    } catch (error) {
        console.log(`Failed to add ${commitmentPoolId}: ${error}`);
    }
}

export async function getOperatorData(commitmentPoolId: string) {
    try {
        let pool = await db.commitmentPools.get({
            commitmentPoolId: commitmentPoolId,
        });

        return pool;
    } catch (error) {
        console.log(`Failed to get ${commitmentPoolId}: ${error}`);
    }
}
