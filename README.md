# Express Rate Limiting Middleware 

Two PoC examples for Express rate limiting middleware using Redis.

They will return a `HTTP 429 Too Many Requests` if the rate exceeds the limit.
Otherwise they will pass onto the next function.

### Usage

Fixed Window

Sets rate limiting to 10 requests in a 1 second fixed window.
```typescript
// fixedWindow(periodInMillis, limit, redisClient)
app.use(fixedWindow(1000, 10, client))
```


Token Bucket

Sets rate limiting to a bucket with capacity of 10 and fill rate of 1 per second.
```typescript
// tokenBucket(fillRatePerSecond, capacity, redisClient)
app.use(tokenBucket(1, 10, client))
```
