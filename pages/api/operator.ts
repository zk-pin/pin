import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react';
import prisma from '@utils/prisma';
import { Operator } from '@prisma/client';

// POST /api/operator
// Required fields in body: title, operator_key, threshold
// Optional fields in body: description
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Operator | any>
) {
  const { operator_key, } = req.body;
  if (!operator_key) {
    res.status(400).json({msg: 'operator_key is a required field'});
    return;
  }

  const session = await getSession({ req });

  if (!session) {
    res.status(400).json({msg: 'you must be in an active session'});
    return;
  }

  // TODO: create operator public and private key pair and pass in pubkey

  const result = await prisma.operator.create({
    data: {
      operator_key: operator_key,
    },
  });
  res.json(result);
}
