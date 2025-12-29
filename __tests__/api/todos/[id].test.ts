import { expect, describe, it, beforeEach } from '@jest/globals';
// import handler from '../../../pages/api/todos/[id]';
import { isAuthenticated } from '../../../lib/auth';
import { getORM } from '../../../lib/db';

jest.mock('../../../lib/auth');
jest.mock('../../../lib/db', () => ({
  getORM: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withORM: (handler: any) => handler,
}));
jest.mock('../../../entities/Todo', () => ({
  Todo: class {},
}));

describe.skip('/api/todos/[id]', () => {
  const mockFindOne = jest.fn();
  const mockFlush = jest.fn();
  const mockRemoveAndFlush = jest.fn();
  const mockFork = jest.fn(() => ({
    findOne: mockFindOne,
    flush: mockFlush,
    removeAndFlush: mockRemoveAndFlush,
  }));

  const validUserId = '507f1f77bcf86cd799439011';
  const todoId = 'todo-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (getORM as jest.Mock).mockResolvedValue({
      em: {
        fork: mockFork,
      },
    });
    (isAuthenticated as jest.Mock).mockReturnValue({ userId: validUserId, role: 'user' });
  });

  it('PUT updates todo for owner', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      query: { id: todoId },
      body: { title: 'Updated Title' },
    });

    mockFindOne.mockResolvedValue({ id: todoId, title: 'Old Title' });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith(
      expect.anything(),
      { id: todoId, owner: validUserId }
    );
    expect(mockFlush).toHaveBeenCalled();
  });

  it('PUT updates todo for admin', async () => {
    (isAuthenticated as jest.Mock).mockReturnValue({ userId: validUserId, role: 'admin' });
    const { req, res } = createMocks({
      method: 'PUT',
      query: { id: todoId },
      body: { title: 'Updated Title' },
    });

    mockFindOne.mockResolvedValue({ id: todoId, title: 'Old Title' });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith(
      expect.anything(),
      { id: todoId }
    );
    expect(mockFlush).toHaveBeenCalled();
  });
});
