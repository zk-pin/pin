import { NextApiRequest, NextApiResponse } from "next/types";
import prisma from "@utils/prisma";

const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);

//PUT /api/setPubKey
export default async function setSignature(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
<<<<<<< HEAD
    const { commitmentPoolId, proof, publicSignals, ciphertext } = req.body;
=======
    const { committmentPoolId, proof, publicSignals, ciphertext } = req.body;
    const options = {
      pinataMetadata: {
        name: "ZKPin",
        keyvalues: {
          committmentPoolId: committmentPoolId,
        },
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    await pinata.pinJSONToIPFS({
      proof,
    });
>>>>>>> cc07396 (feat(wip): more wip)
    await prisma.signature.create({
      data: {
        proof,
        publicSignals,
        ciphertext,
<<<<<<< HEAD
        commitment_pool: {
          connect: { id: commitmentPoolId },
=======
        commitment_poolId: {
          connect: [{ id: committmentPoolId }],
>>>>>>> cc07396 (feat(wip): more wip)
        },
      },
    });

    res.status(200).json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    res.status(404).json({ msg: "Unexpected error occurred" });
  }
}
