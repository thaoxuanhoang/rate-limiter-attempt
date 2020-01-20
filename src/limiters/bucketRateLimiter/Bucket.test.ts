import { Bucket, DEFAULT_REQUEST_WINDOW, DEFAULT_BUCKET_CAPACITY } from './Bucket'
import { State } from './stateStore'


describe('Bucket', () => {
  describe('constructor', () => {
    it('should initialize with default values', () => {
      const bucket = new Bucket()
      expect(bucket.capacity).toBe(DEFAULT_BUCKET_CAPACITY)
      expect(bucket.newTokenIntervalMs).toBe(DEFAULT_REQUEST_WINDOW / DEFAULT_BUCKET_CAPACITY)
    })

    it('should initialize using the input values', () => {
      const bucket = new Bucket({ requestWindowMs: 1000, maxRequestCount: 100 })
      expect(bucket.capacity).toBe(100)
      expect(bucket.newTokenIntervalMs).toBe(10)
    })
  })

  describe('calculateGeneratedTokens', () => {
    it('should generate tokens according to the new token interval', () => {
      // 100 requests per second
      const bucket = new Bucket({ requestWindowMs: 1000, maxRequestCount: 100 })
      const startTimestamp = Date.now()
      const endTimestamp = startTimestamp + 999
      // @ts-ignore
      expect(bucket.calculateGeneratedTokens(startTimestamp, endTimestamp)).toBe(99)
    })

    it('should NOT generate negative number of tokens', () => {
      // 100 requests per second
      const bucket = new Bucket({ requestWindowMs: 1000, maxRequestCount: 100 })
      const startTimestamp = Date.now()
      const endTimestamp = startTimestamp - 999
      // @ts-ignore
      expect(bucket.calculateGeneratedTokens(startTimestamp, endTimestamp)).toBe(0)
    })
  })

  describe('calibrateState', () => {
    it('should create new state with max capacity and consume 1 token', () => {
      const bucket = new Bucket({ requestWindowMs: 10, maxRequestCount: 10 })
      const currentTimestamp = Date.now()

      expect(bucket.calibrateState(undefined, currentTimestamp)).toStrictEqual({
        tokenCount: 10,
        tokenAddedTimestamp: currentTimestamp,
      })
    })

    it('should spill out all new tokens when the bucket is full', () => {
      // 1 request per millisecond
      const bucket = new Bucket({ requestWindowMs: 10, maxRequestCount: 10 })
      const currentTimestamp = Date.now()

      // The last token added was 10 milliseconds ago
      const currentState: State = {
        tokenCount: 10,
        tokenAddedTimestamp: currentTimestamp - 10,
      }

      expect(bucket.calibrateState(currentState, currentTimestamp)).toStrictEqual({
        tokenCount: 10,
        tokenAddedTimestamp: currentTimestamp,
      })
    })

    it('should add newly generated tokens and update timestamp properly', () => {
      // 1 request every 2 milliseconds
      const bucket = new Bucket({ requestWindowMs: 20, maxRequestCount: 10 })
      const currentTimestamp = Date.now()

      // The last token added was 7 milliseconds ago -> there should be 3 new tokens
      const currentState: State = {
        tokenCount: 5,
        tokenAddedTimestamp: currentTimestamp - 7,
      }

      expect(bucket.calibrateState(currentState, currentTimestamp)).toStrictEqual({
        tokenCount: 8,
        tokenAddedTimestamp: currentTimestamp - 1,
      })
    })

    it('keep timestamp as is if there are NO newly generated tokens', () => {
      // 1 request every 5 milliseconds
      const bucket = new Bucket({ requestWindowMs: 10, maxRequestCount: 2 })
      const currentTimestamp = Date.now()
      // The last token added was 1 millisecond ago and it was consumed
      const currentState: State = {
        tokenCount: 0,
        tokenAddedTimestamp: currentTimestamp - 1,
      }

      expect(bucket.calibrateState(currentState, currentTimestamp)).toEqual({
        tokenCount: 0,
        tokenAddedTimestamp: currentTimestamp - 1,
      })
    })
  })

  describe('nextConsumableTimestamp', () => {
    it('should return NOW if there are tokens in the bucket', () => {
      // 1 request per millisecond
      const bucket = new Bucket({ requestWindowMs: 10, maxRequestCount: 10 })
      const currentTimestamp = Date.now()

      const currentState: State = {
        tokenCount: 10,
        tokenAddedTimestamp: currentTimestamp - 10,
      }

      expect(bucket.nextConsumableTimestamp(currentState, currentTimestamp)).toEqual(currentTimestamp)
    })

    it('should return NOW if more than 1 new-token-interval has lapsed', () => {
      // 1 request every 2 milliseconds
      const bucket = new Bucket({ requestWindowMs: 10, maxRequestCount: 5 })
      const currentTimestamp = Date.now()

      const currentState: State = {
        tokenCount: 0,
        tokenAddedTimestamp: currentTimestamp - 3,
      }

      expect(bucket.nextConsumableTimestamp(currentState, currentTimestamp)).toEqual(currentTimestamp)
    })

    it('should return the nearest future timestamp if no new-token-intervals have lapsed', () => {
      // 1 request every 2 milliseconds
      const bucket = new Bucket({ requestWindowMs: 10, maxRequestCount: 5 })
      const currentTimestamp = Date.now()

      const currentState: State = {
        tokenCount: 0,
        tokenAddedTimestamp: currentTimestamp - 1,
      }

      expect(bucket.nextConsumableTimestamp(currentState, currentTimestamp)).toEqual(currentTimestamp + 1)
    })
  })
})
