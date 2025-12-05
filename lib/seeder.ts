import { EntityManager } from '@mikro-orm/mongodb';
import { User } from '../entities/User';
import { Todo, TodoStatus } from '../entities/Todo';
import { hashPassword } from './password';

export const seedDatabase = async (em: EntityManager) => {
  // Clear DB
  await em.nativeDelete(Todo, {});
  await em.nativeDelete(User, {});

  const password = process.env.SEED_DEMO_PASSWORD || 'ChangeMe123!';
  const hashedPassword = await hashPassword(password);

  // Create Admin
  const admin = new User(
    process.env.SEED_ADMIN_NAME || 'Demo Admin',
    process.env.SEED_ADMIN_EMAIL || 'admin@todo.dev',
    hashedPassword,
    'admin'
  );

  // Create User
  const user = new User(
    process.env.SEED_USER_NAME || 'Demo User',
    process.env.SEED_USER_EMAIL || 'user@todo.dev',
    hashedPassword,
    'user'
  );

  em.persist([admin, user]);

  // Create Todos for User
  const todos = [
    new Todo('Buy groceries', user),
    new Todo('Walk the dog', user),
    new Todo('Finish project', user),
    new Todo('Demo Backlog', user),
    new Todo('Demo Pending', user),
    new Todo('Demo In Progress', user),
    new Todo('Demo Completed', user),
    // Admin Todos
    new Todo('Admin Task 1', admin),
    new Todo('Admin Task 2', admin),
  ];
  todos[0].status = TodoStatus.PENDING;
  todos[0].dueTime = new Date(Date.now() + 86400000); // Tomorrow
  
  todos[1].status = TodoStatus.IN_PROGRESS;
  todos[1].dueTime = new Date(Date.now() - 86400000); // Yesterday (Overdue)

  todos[2].status = TodoStatus.COMPLETED;

  todos[3].status = TodoStatus.BACKLOG;
  todos[4].status = TodoStatus.PENDING;
  todos[5].status = TodoStatus.IN_PROGRESS;
  todos[6].status = TodoStatus.COMPLETED;

  todos[7].status = TodoStatus.PENDING;
  todos[8].status = TodoStatus.IN_PROGRESS;

  em.persist(todos);

  await em.flush();
};
