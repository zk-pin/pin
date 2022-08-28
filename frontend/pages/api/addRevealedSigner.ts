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
    const newRevealed = await prisma.revealedSignatureWithProof.create({
      data: {
        user: {
          connect: { id: newRevealedSigners[-1] },
        },
        commitmentPool: {
          connect: { id: commitmentPoolId },
        },
        ipfsHash: "",
      },
    });

    const prevCommitmentPool = await prisma.commitmentPool.findUnique({
      where: { id: commitmentPoolId },
      select: {
        revealedPublicKeys: true,
      },
    });

    if (!prevCommitmentPool?.revealedPublicKeys) {
      res.status(400).json({ msg: "this commitment pool does not exist" });
      return;
    }

    const newRevealedSignerState = [
      ...prevCommitmentPool?.revealedPublicKeys,
      newRevealed,
    ];

    await prisma.commitmentPool.update({
      where: {
        id: commitmentPoolId,
      },
      data: {
        revealedPublicKeys: {
          set: newRevealedSignerState.map((revealedPublicKey) => {
            return {
              id: revealedPublicKey.id,
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
