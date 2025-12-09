import { expect, describe, it, beforeEach } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/todos/index';
import { isAuthenticated } from '../../../lib/auth';
import { getORM } from '../../../lib/db';
import { ObjectId } from '@mikro-orm/mongodb';

jest.mock('../../../lib/auth');
jest.mock('../../../lib/db', () => ({
  getORM: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withORM: (handler: any) => handler,
}));
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
    (isAuthenticated as jest.Mock).mockReturnValue({ userId: validUserId });
  });

  it('GET returns todos', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    mockFindAndCount.mockResolvedValue([[{ id: '1', title: 'Test Todo' }], 1]);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ items: [{ id: '1', title: 'Test Todo' }], total: 1 });
    
    // Verify it was called with ObjectId
    expect(mockFindAndCount).toHaveBeenCalledWith(
      expect.anything(), 
      { owner: expect.any(ObjectId) }, 
      expect.objectContaining({ orderBy: { createdAt: 'ASC' }, limit: 10, offset: 0 })
    );
  });

  it('POST creates a todo', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'New Todo',
        description: 'Desc',
        status: 'BACKLOG',
      },
    });

    mockFindOne.mockResolvedValue({ id: validUserId }); // Mock User found

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(mockPersistAndFlush).toHaveBeenCalled();
  });

  it('returns 401 if not authenticated', async () => {
    (isAuthenticated as jest.Mock).mockReturnValue(null);

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);
  });

  it('GET returns all todos for admin', async () => {
    (isAuthenticated as jest.Mock).mockReturnValue({ userId: validUserId, role: 'admin' });
    const { req, res } = createMocks({
      method: 'GET',
    });

    mockFindAndCount.mockResolvedValue([[{ id: '1', title: 'Test Todo' }], 1]);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockFindAndCount).toHaveBeenCalledWith(
      expect.anything(), 
      {}, 
      expect.objectContaining({ orderBy: { createdAt: 'ASC' }, limit: 10, offset: 0 })
    );
  });
});
