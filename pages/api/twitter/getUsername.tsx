import type { NextApiRequest, NextApiResponse } from 'next'
import { CommitmentPool } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { getToken } from 'next-auth/jwt';

// POST /api/twitter/getUsername
// Required fields in body: userId
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommitmentPool | any>
) {
  const { userId } = req.query;
  if (!userId) {
    res.status(400).json({ msg: 'userId is a required field' });
    return;
  }

  const session = await getSession({ req });
  if (!session) {
    res.status(400).json({ msg: 'you must be in an active session' });
    return;
  }
  const token = await getToken({
    req,
    secret: process.env.NEXT_AUTH_SECRET,
  });

  // TODO: fix get username
  // console.log('session', session);
  // console.log('token', token);

  return res.status(200).json({
    status: 'Ok',
    data: []
  });
}
