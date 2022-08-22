import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react';
import prisma from '@utils/prisma';
import { CommitmentPool } from '@prisma/client';

// POST /api/newPool
// Required fields in body: title, operator_key, threshold
// Optional fields in body: description
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommitmentPool | any>
) {
  const { title, operator_key, threshold, description } = req.body;
  if (!title || operator_key || threshold) {
    res.status(400).json({msg: 'mising a required field'});
    return;
  }

  const session = await getSession({ req });

  const operator = await prisma.operator.findFirst({
    where: {
      operator_key: operator_key
    },
  })

  if (!session) {
    res.status(400).json({msg: 'you must be in an active session'});
    return;
  }

  if (!operator) {
    res.status(400).json({msg: 'cannot find operator'});
    return;
  }

  const commitmentPool = await prisma.commitmentPool.create({
    data: {
      title,
      description,
      created_at: Date.now().toString(),
      threshold,
      operator: {
        connect: { id: operator?.id}
      }
    },
  });

  await prisma.operator.update({
    where: {
      id: operator.id,
    },
    data: {
      commitment_pool: {
        connect: { id: commitmentPool.id}
      }
    },
  })

  res.json(commitmentPool);
}
