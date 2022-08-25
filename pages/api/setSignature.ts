import { NextApiRequest, NextApiResponse } from "next/types";
import prisma from "@utils/prisma";

//PUT /api/setSignature
export default async function setSignature(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { commitmentPoolId, proof, publicSignals, ciphertext } = req.body;

    // enforce no duplicate signatures
    const signatures = await prisma.signature.findMany({
      where: {
        commitment_poolId: commitmentPoolId,
      },
      select: {
        ciphertext: true,
      },
    });

    const containsCipherText = signatures.filter(
      (signature) =>
        JSON.stringify(signature.ciphertext) === JSON.stringify(ciphertext)
    );

    if (containsCipherText.length === 0) {
      await prisma.signature.create({
        data: {
          proof,
          publicSignals,
          ciphertext,
          commitment_pool: {
            connect: { id: commitmentPoolId },
          },
        },
      });
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, msg: "already signed this pool" });
    }
  } catch (err: unknown) {
    console.error(err);
    res.status(404).json({ msg: "Unexpected error occurred" });
  }
}
