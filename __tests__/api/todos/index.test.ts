import { expect, describe, it, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../../app/api/todos/route';
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
jest.mock('../../../entities/User', () => ({
  User: class {},
}));

describe('/api/todos', () => {
  const mockFind = jest.fn();
  const mockFindAndCount = jest.fn();
  const mockFindOne = jest.fn();
  const mockPersistAndFlush = jest.fn();
  const mockFork = jest.fn(() => ({
    find: mockFind,
    findAndCount: mockFindAndCount,
    findOne: mockFindOne,
    persistAndFlush: mockPersistAndFlush,
  }));

  const validUserId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    jest.clearAllMocks();
    (getORM as jest.Mock).mockResolvedValue({
      em: {
        fork: mockFork,
      },
    });
    (isAuthenticatedApp as jest.Mock).mockReturnValue({ userId: validUserId });
  });

  it('GET returns todos', async () => {
    const request = new NextRequest('http://localhost/api/todos', { method: 'GET' });

    mockFindAndCount.mockResolvedValue([[{ id: '1', title: 'Test Todo' }], 1]);

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: [{ id: '1', title: 'Test Todo' }], total: 1 });
    
    // Verify it was called with ObjectId
    expect(mockFindAndCount).toHaveBeenCalledWith(
      expect.anything(), 
      { owner: expect.any(ObjectId) }, 
      expect.objectContaining({ orderBy: { createdAt: 'ASC' }, limit: 10, offset: 0 })
    );
  });

  it('POST creates a todo', async () => {
    const request = new NextRequest('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Todo',
        description: 'Desc',
        status: 'BACKLOG',
      }),
    });

    mockFindOne.mockResolvedValue({ id: validUserId }); // Mock User found

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockPersistAndFlush).toHaveBeenCalled();
  });

  it('returns 401 if not authenticated', async () => {
    (isAuthenticatedApp as jest.Mock).mockReturnValue(null);

    const request = new NextRequest('http://localhost/api/todos', { method: 'GET' });

    await expect(GET(request)).rejects.toThrow('Unauthorized');
  });

  it('GET returns all todos for admin', async () => {
    (isAuthenticatedApp as jest.Mock).mockReturnValue({ userId: validUserId, role: 'admin' });
    const request = new NextRequest('http://localhost/api/todos', { method: 'GET' });

    mockFindAndCount.mockResolvedValue([[{ id: '1', title: 'Test Todo' }], 1]);

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockFindAndCount).toHaveBeenCalledWith(
      expect.anything(), 
      {}, 
      expect.objectContaining({ orderBy: { createdAt: 'ASC' }, limit: 10, offset: 0 })
    );
  });
});
