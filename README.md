# Bucket Rate Limiter

## Reference
- Leaky Bucket:  https://en.wikipedia.org/wiki/Leaky_bucket

## Support new limiting strategy
- Implement the new limiter by extending `BaseRateLimiter` interface, which requires `operate` and `reset` methods.
- Add the new limiter type to `LimiterType` enum & `limiterSwitch` object in `limiterFactory.ts`

## Run tests
The module is fully tested with unit tests & integration tests.
```
npm run test
```

## Sample
```
npm run sample
```
- The limit is 4 requests every 10 seconds -> Every 2.5 seconds, a new token is added
- Request will be triggered every second

### Sample code
```javascript
import { LimiterType, createLimiter, BucketRateLimiter } from './index'

const limiter: BucketRateLimiter = createLimiter(LimiterType.BUCKET_RATE_LIMITER,
  { maxRequestCount: 4, requestWindowMs: 10000 })
const key = 'sample-code'

const myFunc = async () => {
  try {
    await limiter.operate(key)
    console.log('Cool! You can perform your stuff now...')
  } catch (err) {
    if (err.errorCode === 'LIMIT_EXCEEDED_ERROR') {
      console.log(err.message)
    }
  }
}

let currentTime = Date.now()

setInterval(async () => {
  const newCurrentTime = Date.now()
  console.log('--------------')
  console.log((newCurrentTime - currentTime) / 1000 + 'seconds later...')
  currentTime = newCurrentTime

  await myFunc()
}, 1000)

```

### Sample output
```bash
--------------
#1.008 seconds later...
Cool! You can perform your stuff now...
--------------
#1.001 seconds later...
Cool! You can perform your stuff now...
--------------
#1.006 seconds later...
Cool! You can perform your stuff now...
--------------
#1 seconds later...
Cool! You can perform your stuff now...
--------------
#1.002 seconds later...
Cool! You can perform your stuff now...
--------------
#1.002 seconds later...
Cool! You can perform your stuff now...
--------------
#1.005 seconds later...
Rate Limit exceeded. Try again in #1.488 seconds
--------------
#1.003 seconds later...
Rate Limit exceeded. Try again in #0.485 seconds
--------------
#1.001 seconds later...
Cool! You can perform your stuff now...
--------------
#1.004 seconds later...
Rate Limit exceeded. Try again in #0.979 seconds
--------------
#1.001 seconds later...
Cool! You can perform your stuff now...
--------------
#1.003 seconds later...
Rate Limit exceeded. Try again in #1.476 seconds
--------------
#1.002 seconds later...
Rate Limit exceeded. Try again in #0.473 seconds

```
