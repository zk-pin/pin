import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next/types";
import { VKeyRespData } from "../../utils/types";

export default async function getVKey(
  _req: NextApiRequest,
  res: NextApiResponse<VKeyRespData | any>
) {
  try {
    //Find the absolute path of the json directory
    //Read the json data file data.json
    const fileContents = await fs.promises.readFile(
      process.cwd() + "/public/vkey.json",
      "utf8"
    );
    //Return the content of the data file in json format
    res.status(200).json({ vkey: fileContents });
  } catch (ex: unknown) {
    console.error(ex);
    res.status(404).json({ msg: "Unexpected error occurred" });
  }
}
