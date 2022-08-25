import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next/types";
import { VKeyRespData } from "../../utils/types";
import prisma from "@utils/prisma";

//PUT /api/setPubKey
export default async function setPubKey(
  req: NextApiRequest,
  res: NextApiResponse<VKeyRespData | any>
) {
  console.log("attempt setPubKey");
  try {
    const { id, publicKey } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        serializedPublicKey: true,
      },
    });

    // only set a serializedPublicKey if the user hasn't already been assigned one
    if (!user.serializedPublicKey) {
      await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          serializedPublicKey: publicKey,
        },
      });
      res.status(200).json({ success: true });
    } else {
      res.status(409).json({
        // status conflict
        success: true,
        msg: "already set a public key",
        publicKey: user.serializedPublicKey,
      });
    }
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ msg: "Unexpected error occurred" });
  }
}
