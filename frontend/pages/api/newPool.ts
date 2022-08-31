import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@utils/prisma";
import { CommitmentPool } from "@prisma/client";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

// POST /api/newPool
// Required fields in body: title, publicKey, threshold
// Optional fields in body: description
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommitmentPool | any>
) {
  const { title, publicKey, threshold, description } = req.body;
  if (!title || !publicKey || !threshold) {
    res.status(400).json({ msg: "mising a required field" });
    return;
  }

  try {
    // const session = await getSession({ req }); // need to use unstable for prod
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
      res.status(400).json({ msg: "you must be in an active session" });
      return;
    }

    let operator = await prisma.operator.findFirst({
      where: {
        operator_key: publicKey,
      },
    });

    if (!operator) {
      operator = await prisma.operator.create({
        data: {
          operator_key: publicKey,
        },
      });
    }

    const commitmentPool = await prisma.commitmentPool.create({
      data: {
        title,
        description,
        threshold: parseInt(threshold, 10),
        operator: {
          connect: { id: operator?.id },
        },
      },
    });
    res.json({ ...commitmentPool, id: commitmentPool.id });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ err });
    return;
  }
}
