import createLimiter, { LimiterType, OperationOptions } from './limiterFactory'
import { ValidationError } from './errors'
import BucketRateLimiter from './bucketRateLimiter'

describe('limiterFactory', () => {
  describe('createLimiter', () => {
    it('should throw if max number of request is not positive', () => {
      const operationOptions: OperationOptions = {
        maxRequestCount: 0,
        requestWindowMs: 100,
      }

      expect(() => {
        createLimiter(LimiterType.BUCKET_RATE_LIMITER, operationOptions)
      }).toThrow(ValidationError)
    })

    it('should throw if request window is not positive', () => {
      const operationOptions: OperationOptions = {
        maxRequestCount: 100,
        requestWindowMs: 0,
      }

      expect(() => {
        createLimiter(LimiterType.BUCKET_RATE_LIMITER, operationOptions)
      }).toThrow(ValidationError)
    })

    it('should NOT throw if default operation options are used', () => {
      expect(() => {
        createLimiter(LimiterType.BUCKET_RATE_LIMITER)
      }).not.toThrow(ValidationError)
    })

    it('should return the correct limiter type', () => {
      const limiter = createLimiter(LimiterType.BUCKET_RATE_LIMITER)
      expect(limiter instanceof BucketRateLimiter).toBeTruthy()
    })
  })
})
