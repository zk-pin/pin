import { NextApiRequest, NextApiResponse } from "next/types";
import prisma from "@utils/prisma";

//PUT /api/setPubKey
export default async function setSignature(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { commitmentPoolId, proof, publicSignals, ciphertext } = req.body;
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
  } catch (err: unknown) {
    console.error(err);
    res.status(404).json({ msg: "Unexpected error occurred" });
  }
}
