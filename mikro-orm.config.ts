import 'reflect-metadata';
import { defineConfig } from '@mikro-orm/mongodb';
import { User } from './src/entities/User';
import { Todo } from './src/entities/Todo';
import { ReflectMetadataProvider } from '@mikro-orm/core';

export default defineConfig({
  entities: [User, Todo],
  clientUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/next-todo-app',
  metadataProvider: ReflectMetadataProvider,
  debug: false,
  migrations: {
    path: './migrations',
    pathTs: './migrations',
  },
});
