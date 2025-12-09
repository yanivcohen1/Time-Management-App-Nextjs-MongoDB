import { NextApiRequest, NextApiResponse } from 'next';
import { withORM, getORM } from '../../../lib/db';
import { Todo, TodoStatus } from '../../../entities/Todo';
import { isAuthenticated } from '../../../lib/auth';
import { User } from '../../../entities/User';
import { ObjectId } from '@mikro-orm/mongodb';
import { FilterQuery } from '@mikro-orm/core';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const userPayload = isAuthenticated(req, res);
  if (!userPayload) return;

  const orm = await getORM();
  const em = orm.em.fork();

  if (req.method === 'GET') {
    try {
      const filter: FilterQuery<Todo> = {};
      const { userId, status, title, startDate, endDate } = req.query;

      if (userPayload.role === 'admin') {
        if (userId && typeof userId === 'string') {
          filter.owner = new ObjectId(userId);
        }
      } else {
        filter.owner = new ObjectId(userPayload.userId);
      }

      if (status && typeof status === 'string' && status !== 'ALL') {
        if (Object.values(TodoStatus).includes(status as TodoStatus)) {
            filter.status = status as TodoStatus;
        }
      }

      if (title && typeof title === 'string') {
        filter.title = new RegExp(title, 'i');
      }

      if ((startDate && typeof startDate === 'string') || (endDate && typeof endDate === 'string')) {
        const dateFilter: any = {};
        if (startDate && typeof startDate === 'string') {
           dateFilter.$gte = new Date(startDate);
        }
        if (endDate && typeof endDate === 'string') {
           const end = new Date(endDate);
           end.setHours(23, 59, 59, 999);
           dateFilter.$lte = end;
        }
        filter.dueTime = dateFilter;
      }

      const todos = await em.find(Todo, filter, { orderBy: { createdAt: 'DESC' } });
      return res.status(200).json(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      return res.status(500).json({ message: 'Error fetching todos' });
    }
  }

  if (req.method === 'POST') {
    const { title, description, dueTime, status } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const user = await em.findOne(User, { _id: new ObjectId(userPayload.userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const todo = new Todo(title, user);
    if (description) todo.description = description;
    if (dueTime) todo.dueTime = new Date(dueTime);
    if (status) todo.status = status;

    await em.persistAndFlush(todo);
    return res.status(201).json(todo);
  }

  return res.status(405).json({ message: 'Method not allowed' });
};

export default withORM(handler);
