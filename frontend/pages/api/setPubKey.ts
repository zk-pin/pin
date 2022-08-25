import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next/types";
import { VKeyRespData } from "../../utils/types";

//PUT /api/setPubKey
export default async function setPubKey(
  req: NextApiRequest,
  res: NextApiResponse<VKeyRespData | any>
) {
  try {
    const { id, publicKey } = req.body;
    const user = await prisma.user.findMany({
      where: {
        id: id,
      },
      select: {
        serializedPublicKey: true,
      },
    });
    if (user.serializedPublicKey === "") {
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
      res.status(200).json({ success: true, msg: "already set a public key" });
    }
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ msg: "Unexpected error occurred" });
  }
}
