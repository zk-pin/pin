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
    const { committmentPoolId, proof, publicSignals, ciphertext } = req.body;
    const options = {
      pinataMetadata: {
        name: "ZKPin",
        keyvalues: {
          committmentPoolId: committmentPoolId.toString(),
        },
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    const res = await pinata.pinJSONToIPFS(
      {
        proof,
        publicSignals,
      },
      options
    );

    console.log("ipfs: ", res);

    await prisma.signature.create({
      data: {
        proof,
        publicSignals,
        ciphertext,
        commitment_poolId: {
          connect: [{ id: committmentPoolId }],
        },
      },
    });

    res.status(200).json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    res.status(404).json({ msg: "Unexpected error occurred" });
  }
}
