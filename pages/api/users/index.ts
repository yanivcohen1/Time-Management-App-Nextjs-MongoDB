import { NextApiRequest, NextApiResponse } from 'next';
import { withORM, getORM } from '../../../lib/db';
import { User } from '../../../entities/User';
import { isAuthenticated } from '../../../lib/auth';
import { handleError, json, ApiError } from "@/lib/http";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const userPayload = isAuthenticated(req, res);
  if (!userPayload) return;

  if (userPayload.role !== 'admin') {
    throw new ApiError(403, "Forbidden Admin required");
    // return res.status(403).json({ message: 'Forbidden' });
  }

  const orm = await getORM();
  const em = orm.em.fork();

  if (req.method === 'GET') {
    try {
      const users = await em.find(User, {}, { fields: ['id', 'name', 'email', 'role'] });
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Error fetching users' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default withORM(handler);
