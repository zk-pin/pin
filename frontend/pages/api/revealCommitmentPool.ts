import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@utils/prisma";
import { CommitmentPool } from "@prisma/client";

// PUT /api/revealCommitmentPool
// Required fields in body: title, publicKey, threshold
// Optional fields in body: description
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommitmentPool | any>
) {
  // revealed signers is of type IDecryptedSigners
  const { id, revealedSigners } = req.body;
  if (!id || !revealedSigners) {
    res.status(400).json({ msg: "mising a required field" });
    return;
  }
  try {
    // map the revealed signers to the relevant users
    const revealedPublicKeysIds = [];

    for (const revealedSigner of revealedSigners) {
      const { serializedPubKey, ipfsHash } = revealedSigner;
      const tempUser = await prisma.user.findUnique({
        where: {
          serializedPublicKey: serializedPubKey,
        },
        select: {
          name: true,
          id: true,
          serializedPublicKey: true,
        },
      });
      if (tempUser) {
        const newRevealed = await prisma.revealedSignatureWithProof.create({
          data: {
            user: {
              connect: { id: tempUser.id },
            },
            commitmentPool: {
              connect: { id: id },
            },
            ipfsHash: ipfsHash,
          },
        });
        revealedPublicKeysIds.push(newRevealed);
      }
    }

    const pool = await prisma.commitmentPool.update({
      where: {
        id: id,
      },
      data: {
        revealedPublicKeys: {
          connect: revealedPublicKeysIds.map((revealed) => {
            return {
              id: revealed.id,
            };
          }),
        },
      },
    });
    res.status(200).json({ pool });
    return;
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ err });
    return;
  }
}
