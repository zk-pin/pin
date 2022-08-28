import { NextApiRequest, NextApiResponse } from "next/types";
import { VKeyRespData } from "../../utils/types";
import prisma from "@utils/prisma";

//PUT /api/addRevealedSigner
export default async function addRevealedSigner(
  req: NextApiRequest,
  res: NextApiResponse<VKeyRespData | any>
) {
  try {
    // newRevealedSigners is a list of user ids
    const { newRevealedSigners, commitmentPoolId } = req.body;
    const revealedPublicKeysIds: number[] = [];

    newRevealedSigners.map(async (userId: string) => {
      const newRevealed = await prisma.revealedSignatureWithProof.create({
        data: {
          user: {
            connect: { id: userId },
          },
          commitmentPool: {
            connect: { id: commitmentPoolId },
          },
          ipfsHash: "",
        },
      });
      revealedPublicKeysIds.push(newRevealed.id);
    });
    await prisma.commitmentPool.update({
      where: {
        id: commitmentPoolId,
      },
      data: {
        revealedPublicKeys: {
          set: revealedPublicKeysIds.map((revealedPublicKeyId: number) => {
            return {
              id: revealedPublicKeyId,
            };
          }),
        },
      },
    });
    res.status(200).json({ success: true });
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ msg: "Unexpected error occurred" });
  }
}
