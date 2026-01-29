import { NextRequest } from 'next/server';
import { getORM, handleError } from '@/lib/db';
import { User } from '@/entities/User';
import { comparePassword } from '@/lib/password';
import { signToken } from '@/lib/auth';

interface user {
        id: string,
        name: string,
        email: string,
        role: User["role"],
      }

export interface loginPostResponse{
        token: string,
        user: user,
      }

export interface loginPostParams{
        email: string,
        password: string,
      }

export async function handlerPOST(request: NextRequest) {
  try {
    const { email, password } = await request.json() as loginPostParams;

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
    
    return Response.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      } as loginPostResponse);
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export const POST = handleError(handlerPOST);