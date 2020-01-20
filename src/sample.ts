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
  console.log(`#${(newCurrentTime - currentTime) / 1000} seconds later...`)
  currentTime = newCurrentTime

  await myFunc()
}, 1000)
