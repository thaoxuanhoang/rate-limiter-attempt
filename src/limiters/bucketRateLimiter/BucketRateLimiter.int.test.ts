import BucketRateLimiter from './BucketRateLimiter'
import { LimitExceededError } from '../errors'
import stateStore from './stateStore'

describe('BucketRateLimiter Integrations', () => {
  const operatorId = 'http://random-domain/random-path/random-id'
  const getStateSpy = jest.spyOn(stateStore, 'getState')
  const updateStateSpy = jest.spyOn(stateStore, 'updateState')

  beforeEach(() => {
    stateStore.deleteState(operatorId)
    getStateSpy.mockClear()
    updateStateSpy.mockClear()
  })

  describe('operate', () => {
    it('should throw error if limit is exceeded', async () => {
      const limiter = new BucketRateLimiter({ maxRequestCount: 1, requestWindowMs: 1000 })

      // Fire 2 operations consecutively
      await expect(limiter.operate(operatorId)).resolves.toBeUndefined()
      await expect(limiter.operate(operatorId)).rejects.toThrowError(LimitExceededError)

      expect(getStateSpy).toBeCalledTimes(2)
      expect(updateStateSpy).toBeCalledTimes(1)
    })

    it('should throw error if multiple tokens are fetched at the same time', async () => {
      const limiter = new BucketRateLimiter({ maxRequestCount: 2, requestWindowMs: 1000 })

      // Fire 2 operations consecutively without waiting
      limiter.operate(operatorId)
      await expect(limiter.operate(operatorId)).rejects.toThrowError('Multiple tokens are fetched simultaneously.')

      expect(getStateSpy).toBeCalledTimes(2)
      expect(updateStateSpy).toBeCalledTimes(2)
    })

    it('should be able to operate after the waiting period', async () => {
      const limiter = new BucketRateLimiter({ maxRequestCount: 1, requestWindowMs: 1000 })

      // Fire 2 operations consecutively
      await expect(limiter.operate(operatorId)).resolves.toBeUndefined()
      await expect(limiter.operate(operatorId)).rejects.toThrowError(LimitExceededError)

      // Sleep to wait for new token
      await new Promise((r) => setTimeout(r, 1000))
      await expect(limiter.operate(operatorId)).resolves.toBeUndefined()

      expect(getStateSpy).toBeCalledTimes(3)
      expect(updateStateSpy).toBeCalledTimes(2)
    })
  })

  describe('reset', () => {
    it('should renew the state and allow operation', async () => {
      const limiter = new BucketRateLimiter({ maxRequestCount: 1, requestWindowMs: 1000 })

      // Exhaust the tokens
      await expect(limiter.operate(operatorId)).resolves.toBeUndefined()
      await expect(limiter.operate(operatorId)).rejects.toThrowError(LimitExceededError)

      // Reset
      limiter.reset(operatorId)
      await expect(limiter.operate(operatorId)).resolves.toBeUndefined()
    })
  })
})
