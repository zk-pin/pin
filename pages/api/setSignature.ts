import { NextApiRequest, NextApiResponse } from "next/types";

//PUT /api/setPubKey
export default async function setSignature(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { committmentPoolId, proof, publicSignals, ciphertext } = req.body;
    await prisma.signature.create({
      data: {
        proof,
        publicSignals,
        ciphertext,
        commitment_poolId: committmentPoolId,
      },
    });

    res.status(200).json({ success: true });
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ msg: "Unexpected error occurred" });
  }
}
