import { LimitExceededError } from './errors'

describe('errors', () => {
  describe('LimitExceededError', () => {
    describe('constructor', () => {
      it('should throw if nextAvailableTimeInSeconds is not positive', () => {
        expect(() => {
          new LimitExceededError(-1)
        }).toThrow('nextAvailableTimeInSeconds must be positive.')
      })
    })
  })
})
