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
  todos[0].description = 'Buy milk, eggs, and bread from the supermarket.';
  todos[0].duration = 1;
  
  todos[1].status = TodoStatus.IN_PROGRESS;
  todos[1].dueTime = new Date(Date.now() - 86400000); // Yesterday (Overdue)
  todos[1].description = 'Take the dog for a walk in the park.';
  todos[1].duration = 0.5;

  todos[2].status = TodoStatus.COMPLETED;
  todos[2].description = 'Complete the final report for the project.';
  todos[2].duration = 2;

  todos[3].status = TodoStatus.BACKLOG;
  todos[3].description = 'This is a backlog item for demonstration purposes.';
  todos[3].duration = 0.25;

  todos[4].status = TodoStatus.PENDING;
  todos[4].description = 'This is a pending item for demonstration purposes.';
  todos[4].duration = 0.75;

  todos[5].status = TodoStatus.IN_PROGRESS;
  todos[5].description = 'This is an in-progress item for demonstration purposes.';
  todos[5].duration = 1.5;

  todos[6].status = TodoStatus.COMPLETED;
  todos[6].description = 'This is a completed item for demonstration purposes.';
  todos[6].duration = 0.5;

  todos[7].status = TodoStatus.PENDING;
  todos[7].description = 'Review system logs and monitor performance.';
  todos[7].duration = 1;

  todos[8].status = TodoStatus.IN_PROGRESS;
  todos[8].description = 'Update user permissions and roles.';
  todos[8].duration = 0.5;

  em.persist(todos);

  await em.flush();
};
