import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next/types";
import { VKeyRespData } from "../../utils/types";

//GET /api/getPubKey
export default async function getPubKey(
  req: NextApiRequest,
  res: NextApiResponse<VKeyRespData | any>
) {
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

    res.status(200).json({
      // status conflict
      success: true,
      publicKey: user.serializedPublicKey,
    });
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ msg: "Unexpected error occurred" });
  }
}
