import { MikroORM, RequestContext } from '@mikro-orm/core';
import { MongoDriver, MongoEntityManager } from '@mikro-orm/mongodb';
import config from '../mikro-orm.config';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { handleError, json, ApiError } from "@/lib/http";

// Global cache to prevent multiple connections in dev
const globalForORM = global as unknown as { orm: MikroORM<MongoDriver> };

export const getORM = async () => {
  if (!globalForORM.orm) {
    globalForORM.orm = await MikroORM.init<MongoDriver>(config);
  }
  return globalForORM.orm;
};

export const withORM = (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
  const orm = await getORM();
  return RequestContext.create(orm.em, async () => {
    try {
      return handler(req, res);
    } catch (error) {
    return handleError(error);
  }
  });
};

export type EntityManager = MongoEntityManager;
