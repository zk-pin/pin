import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "@utils/prisma";
import { CommitmentPool, User } from "@prisma/client";

// PUT /api/revealCommitmentPool
// Required fields in body: title, publicKey, threshold
// Optional fields in body: description
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommitmentPool | any>
) {
  const { id, revealedSigners } = req.body;
  if (!id || !revealedSigners) {
    res.status(400).json({ msg: "mising a required field" });
    return;
  }
  try {
    // map the revealed signers to the relevant users
    const users: any[] = []; // TODO: no ANY

    for (const revealedPublicKey of revealedSigners) {
      const tempUser = await prisma.user.findUnique({
        where: {
          serializedPublicKey: revealedPublicKey,
        },
        select: {
          name: true,
          id: true,
          serializedPublicKey: true,
        },
      });
      if (tempUser) {
        users.push(JSON.parse(JSON.stringify(tempUser)));
      }
    }
    await prisma.commitmentPool.update({
      where: {
        id: id,
      },
      data: {
        revealedPublicKeys: {
          connect: users.map((user) => {
            return {
              id: user.id,
            };
          }),
        },
      },
    });
    console.log("matching users", users);
    return users;
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ err });
    return;
  }
}
