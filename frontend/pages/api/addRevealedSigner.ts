import { NextApiRequest, NextApiResponse } from "next/types";
import { VKeyRespData } from "../../utils/types";
import prisma from "@utils/prisma";

//PUT /api/addRevealedSigner
export default async function addRevealedSigner(
  req: NextApiRequest,
  res: NextApiResponse<VKeyRespData | any>
) {
  try {
    const { newRevealedSigners, commitmentPoolId } = req.body;
    await prisma.commitmentPool.update({
      where: {
        id: commitmentPoolId,
      },
      data: {
        revealedPublicKeys: {
          set: newRevealedSigners.map((signer: string) => {
            return {
              id: signer,
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
