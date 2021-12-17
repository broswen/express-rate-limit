import { NextFunction, Request, Response } from "express";
import { RedisClientType } from "redis";

export const fixedWindow = function (periodInMillis: number, limit: number, redis: any) {
  return async function (req: Request, res: Response, next: NextFunction) {
    // create unique key for path and current period
    const id = `${req.path}/${Math.floor(new Date().getTime() / periodInMillis)}`;
    const count = await redis.incr(id);
    // get value, if greater than rate, return 429
    // if not greater than rate, incr and pass to handler
    if (count > limit) {
      res.status(429);
      res.send('Too Many Requests');
    } else {
      next();
    }
  }
}

export const tokenBucket = function (fillRatePerSecond: number, capacity: number, redis: any) {
  return async function (req: Request, res: Response, next: NextFunction) {
    // calculate bucket and last request keys for redis
    const bucketKey = `${req.path}/tokens`;
    const lastRequestKey = `${req.path}/lastRequest`;
    // get current timestamp in millis
    const now = new Date().getTime()
    // get previous request timestamp in millis
    const lastRequest = Number(await redis.get(lastRequestKey));
    // set previous to current
    await redis.set(lastRequestKey, now)
    // calculate tokens to add to bucket with time since last request and token rate 
    const tokensToAdd = (1 / fillRatePerSecond) * (now - lastRequest) / 1000;
    const tokens = Number(await redis.incrByFloat(bucketKey, tokensToAdd));

    // set to max size if exceeds bucket capacity
    if (tokens > capacity) {
      await redis.set(bucketKey, capacity)
    }

    // drop if not enough tokens
    if (tokens < 1) {
      res.status(429)
      res.send('Too Many Requests')
    } else {
      // subtract token
      await redis.incrByFloat(bucketKey, -1.0);
      next();
    }
  }
}