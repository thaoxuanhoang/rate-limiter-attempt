export class LimitExceededError extends Error {
  public errorCode = 'LIMIT_EXCEEDED_ERROR'
  public statusCode = '429'

  constructor(public nextAvailableTimeInSeconds: number) {
    super('')

    if (nextAvailableTimeInSeconds <= 0) {
      throw new Error('nextAvailableTimeInSeconds must be positive.')
    }

    this.message = `Rate Limit exceeded. Try again in #${nextAvailableTimeInSeconds} seconds`
    this.name = 'LimitExceededError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
