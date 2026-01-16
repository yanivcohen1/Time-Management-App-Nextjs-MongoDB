import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';
import { ApiError } from "@/lib/http"

const SECRET = process.env.JWT_ACCESS_SECRET || 'secret';
const TTL = parseInt(process.env.JWT_ACCESS_TTL_SECONDS || '3600', 10);

export interface TokenPayload {
  userId: string;
  role: 'user' | 'admin';
}

export const signToken = (payload: TokenPayload) => {
  return jwt.sign(payload, SECRET, { expiresIn: TTL });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
};

export const getAuthToken = (req: NextApiRequest) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

export const isAuthenticated = (req: NextApiRequest, res: NextApiResponse) => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ message: 'Invalid token' });
    return null;
  }
  return payload;
};

export const getAuthTokenApp = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

export const isAuthenticatedApp = (request: NextRequest) => {
  const token = getAuthTokenApp(request);
  if (!token) {
    throw new ApiError(401, 'Unauthorized');
    return null;
  }
  const payload = verifyToken(token);
  if (!payload) {
    throw new ApiError(401, 'Unauthorized');
    return null;
  }
  return payload;
};
