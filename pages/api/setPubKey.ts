import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next/types";
import { VKeyRespData } from "../../utils/types";
import prisma from "@utils/prisma";

//PUT /api/setPubKey
export default async function setPubKey(
  req: NextApiRequest,
  res: NextApiResponse<VKeyRespData | any>
) {
  try {
    const { id, publicKey } = req.body;
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        serializedPublicKey: publicKey,
      },
    });

    res.status(200).json({ success: true });
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ msg: "Unexpected error occurred" });
  }
}
