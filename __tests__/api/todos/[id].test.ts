import { expect, describe, it, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { PUT, DELETE } from '../../../app/api/todos/[id]/route';
import { isAuthenticatedApp } from '../../../lib/auth';
import { getORM } from '../../../lib/db';
import { ObjectId } from '@mikro-orm/mongodb';

jest.mock('../../../lib/auth');
jest.mock('../../../lib/db', () => ({
  getORM: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError: (handler: any) => handler,
}));
jest.mock('@mikro-orm/core', () => {
  const actual = jest.requireActual('@mikro-orm/core');
  return {
    ...actual,
    serialize: jest.fn((obj) => obj),
  };
});
jest.mock('../../../entities/Todo', () => ({
  Todo: class {},
}));

describe('/api/todos/[id]', () => {
  const mockFindOne = jest.fn();
  const mockFlush = jest.fn();
  const mockRemoveAndFlush = jest.fn();
  const mockFork = jest.fn(() => ({
    findOne: mockFindOne,
    flush: mockFlush,
    removeAndFlush: mockRemoveAndFlush,
  }));

  const validUserId = '507f1f77bcf86cd799439011';
  const todoId = '507f1f77bcf86cd799439012';

  beforeEach(() => {
    jest.clearAllMocks();
    (getORM as jest.Mock).mockResolvedValue({
      em: {
        fork: mockFork,
      },
    });
    (isAuthenticatedApp as jest.Mock).mockReturnValue({ userId: validUserId, role: 'user' });
  });

  it('PUT updates todo for owner', async () => {
    const request = new NextRequest('http://localhost/api/todos/todo-123', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    mockFindOne.mockResolvedValue({ id: todoId, title: 'Old Title' });

    const response = await PUT(request, { params: Promise.resolve({ id: todoId }) });

    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith(
      expect.anything(),
      { _id: new ObjectId(todoId), owner: new ObjectId(validUserId) }
    );
    expect(mockFlush).toHaveBeenCalled();
  });

  it('PUT updates todo for admin', async () => {
    (isAuthenticatedApp as jest.Mock).mockReturnValue({ userId: validUserId, role: 'admin' });
    const request = new NextRequest('http://localhost/api/todos/todo-123', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated Title' }),
    });

    mockFindOne.mockResolvedValue({ id: todoId, title: 'Old Title' });

    const response = await PUT(request, { params: Promise.resolve({ id: todoId }) });

    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith(
      expect.anything(),
      { _id: new ObjectId(todoId) }
    );
    expect(mockFlush).toHaveBeenCalled();
  });

  it('DELETE removes todo for owner', async () => {
    const request = new NextRequest('http://localhost/api/todos/todo-123', {
      method: 'DELETE',
    });

    mockFindOne.mockResolvedValue({ id: todoId, title: 'Old Title' });

    const response = await DELETE(request, { params: Promise.resolve({ id: todoId }) });

    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith(
      expect.anything(),
      { _id: new ObjectId(todoId), owner: new ObjectId(validUserId) }
    );
    expect(mockRemoveAndFlush).toHaveBeenCalled();
  });
});
