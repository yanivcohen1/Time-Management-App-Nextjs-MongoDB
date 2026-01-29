import { NextRequest } from 'next/server';
import { getORM, handleError } from '@/lib/db';
import { User } from '@/entities/User';
import { comparePassword } from '@/lib/password';
import { signToken } from '@/lib/auth';

export interface Iuser {
        id: string,
        name: string,
        email: string,
        role: User["role"],
      }

export interface userResponse{
        token: string,
        user: Iuser,
      }

export async function handlerPOST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const orm = await getORM();
    const em = orm.em.fork();

    const user = await em.findOne(User, { email });
    
    if (!user) {
      return Response.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return Response.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, role: user.role });

    const userRet: Iuser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

    const userResponse: userResponse = {
        token,
        user: userRet,
      };
    return Response.json(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export const POST = handleError(handlerPOST);