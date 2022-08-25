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
    const { commitmentPoolId, proof, publicSignals, ciphertext } = req.body;
    console.log("what is going on: ", commitmentPoolId);
    const options = {
      pinataMetadata: {
        name: "ZKPin",
        keyvalues: {
          commitmentPoolId: commitmentPoolId.toString(),
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
          ipfs: {
            create: {
              ipfsHash: res.IpfsHash,
              pinSize: res.PinSize,
              timestamp: res.Timestamp,
            },
          },
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
    res.status(400).json({ msg: "Unexpected error occurred" });
  }
}
