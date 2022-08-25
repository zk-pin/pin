import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "@utils/prisma";
import { Operator } from "@prisma/client";

// GET /api/operator/:id
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Operator | any>
) {
    const { id } = req.query;
    if (!id) {
        res.status(400).json({ msg: "operator's id is a required field" });
        return;
    }

    if (typeof id !== "string") {
        res.status(400).json({ msg: "id must be a string" });
        return;
    }

    const session = await getSession({ req });

    if (!session) {
        res.status(400).json({ msg: "you must be in an active session" });
        return;
    }

    const result = await prisma.operator.findUnique({
        where: {
            id: parseInt(id),
        },
    });
    res.json(result);
}
