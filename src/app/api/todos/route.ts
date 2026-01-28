import { NextRequest, NextResponse } from 'next/server';
import { getORM, handleError } from '@/lib/db';
import { Todo, TodoStatus } from '@/entities/Todo';
import { isAuthenticatedApp, isAdmin } from '@/lib/auth';
import { User } from '@/entities/User';
import { ObjectId } from '@mikro-orm/mongodb';
import { FilterQuery, serialize } from '@mikro-orm/core';
import { ApiError } from "@/lib/http"

async function handlerGET(request: NextRequest) {
  const userPayload = await isAuthenticatedApp();
  if (!userPayload) 
    // return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    throw new ApiError(401, 'Unauthorized');

  const orm = await getORM();
  const em = orm.em.fork();

  const { searchParams } = new URL(request.url);
  const filter: FilterQuery<Todo> = {};
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');
  const title = searchParams.get('title');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const orderBy = searchParams.get('orderBy');
  const order = searchParams.get('order');

  const pageNum = page ? parseInt(page, 10) : 0;
  const limitNum = limit ? parseInt(limit, 10) : 10;

  if (isNaN(pageNum) || pageNum < 0) {
    throw new ApiError(400, 'Invalid page');
  }
  if (isNaN(limitNum) || limitNum < 0) {
    throw new ApiError(400, 'Invalid limit');
  }

  const offset = pageNum * limitNum;

  if (userPayload.role === 'admin') {
    await isAdmin();
    if (userId) {
      filter.owner = new ObjectId(userId);
    }
  } else {
    filter.owner = new ObjectId(userPayload.userId);
  }

  if (status && status !== 'ALL') {
    if (Object.values(TodoStatus).includes(status as TodoStatus)) {
      filter.status = status as TodoStatus;
    }
  }

  if (title) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (filter as any).title = { $regex: title, $options: 'i' };
  }

  if (startDate || endDate) {
    const dateFilter: { $gte?: Date; $lte?: Date } = {};
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new ApiError(400, 'Invalid startDate format');
      }
      dateFilter.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new ApiError(400, 'Invalid endDate format');
      }
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }
    filter.dueTime = dateFilter;
  }

  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
  const sortField = orderBy || 'createdAt';

  if (!['title', 'description', 'status', 'dueTime', 'duration', 'createdAt', 'updatedAt'].includes(sortField)) {
    throw new ApiError(400, 'Invalid orderBy field');
  }

  const [todos, count] = await em.findAndCount(Todo, filter, {
    orderBy: { [sortField]: sortOrder },
    limit: limitNum,
    offset: offset,
    populate: ['owner']
  });

  const serializedTodos = todos.map(todo => serialize(todo));

  return NextResponse.json({ items: serializedTodos, total: count });
}

async function handlerPOST(request: NextRequest) {
  const userPayload = await isAuthenticatedApp();
  if (!userPayload) 
    throw new ApiError(401, 'Unauthorized');
    //return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const orm = await getORM();
  const em = orm.em.fork();

  const { title, description, dueTime, status, duration } = await request.json();
  if (!title) {
    throw new ApiError(400, 'Title is required');
  }

  const user = await em.findOne(User, { _id: new ObjectId(userPayload.userId) });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const todo = new Todo(title, user);
  if (description) todo.description = description;
  if (dueTime) {
    const dueDate = new Date(dueTime);
    if (isNaN(dueDate.getTime())) {
      throw new ApiError(400, 'Invalid dueTime format');
    }
    todo.dueTime = dueDate;
  }
  if (status) todo.status = status;
  if (duration) todo.duration = duration;

  await em.persistAndFlush(todo);
  return NextResponse.json(serialize(todo), { status: 201 });
}

export const GET = handleError(handlerGET);
export const POST = handleError(handlerPOST);