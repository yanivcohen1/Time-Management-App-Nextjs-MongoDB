import { MikroORM, RequestContext } from '@mikro-orm/core';
import { MongoDriver, MongoEntityManager } from '@mikro-orm/mongodb';
import config from '../mikro-orm.config';
import { NextRequest, NextResponse } from 'next/server';
import { handleError } from "@/lib/http";

// Global cache to prevent multiple connections in dev
const globalForORM = global as unknown as { orm: MikroORM<MongoDriver> };

export const getORM = async () => {
  if (!globalForORM.orm) {
    globalForORM.orm = await MikroORM.init<MongoDriver>(config);
  }
  return globalForORM.orm;
};

type AppRouterHandler = (req: NextRequest) => NextResponse | Response | Promise<NextResponse> | Promise<Response>;

export const withORM = (handler: AppRouterHandler) => async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      return await handleError(error);
    }
};

export type EntityManager = MongoEntityManager;
