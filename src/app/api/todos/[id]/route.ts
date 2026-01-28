import { NextRequest, NextResponse } from 'next/server';
import { getORM, handleError } from '@/lib/db';
import { Todo } from '@/entities/Todo';
import { isAuthenticatedApp } from '@/lib/auth';
import { ApiError } from '@/lib/http';
import { FilterQuery, serialize } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

export async function handlerPUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userPayload = await isAuthenticatedApp();
  if (!userPayload) throw new ApiError(401, 'Unauthorized');

  const orm = await getORM();
  const em = orm.em.fork();

  const filter: FilterQuery<Todo> = { _id: new ObjectId(id) };
  if (userPayload.role !== 'admin') {
    filter.owner = new ObjectId(userPayload.userId);
  }
  
  const todo = await em.findOne(Todo, filter);

  if (!todo) {
    throw new ApiError(404, 'Todo not found');
  }

  const { title, description, status, dueTime, duration } = await request.json();

  if (title !== undefined) todo.title = title;
  if (description !== undefined) todo.description = description;
  if (status !== undefined) todo.status = status;
  if (dueTime !== undefined) {
    if (dueTime) {
      const dueDate = new Date(dueTime);
      if (isNaN(dueDate.getTime())) {
        throw new ApiError(400, 'Invalid dueTime format');
      }
      todo.dueTime = dueDate;
    } else {
      todo.dueTime = undefined;
    }
  }
  if (duration !== undefined) todo.duration = duration;

  await em.flush();
  return NextResponse.json(serialize(todo));
}

export async function handlerDELETE(request: NextRequest, context : { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const userPayload = await isAuthenticatedApp();
  if (!userPayload) throw new ApiError(401, 'Unauthorized');

  const orm = await getORM();
  const em = orm.em.fork();

  const filter: FilterQuery<Todo> = { _id: new ObjectId(id) };
  if (userPayload.role !== 'admin') {
    filter.owner = new ObjectId(userPayload.userId);
  }
  
  const todo = await em.findOne(Todo, filter);

  if (!todo) {
    throw new ApiError(404, 'Todo not found');
  }

  await em.removeAndFlush(todo);
  return NextResponse.json({ message: 'Todo deleted' });
}

export const PUT = handleError(handlerPUT);
export const DELETE = handleError(handlerDELETE);