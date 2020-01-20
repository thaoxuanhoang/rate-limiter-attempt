import BucketRateLimiter from './bucketRateLimiter'
import { ValidationError } from './errors'
import { isNil, get } from 'lodash'

export enum LimiterType {
  BUCKET_RATE_LIMITER = 'bucketRateLimiter',
}

export interface OperationOptions {
  maxRequestCount?: number
  requestWindowMs?: number
}

const limiterSwitch: any = {}
limiterSwitch[LimiterType.BUCKET_RATE_LIMITER] = BucketRateLimiter

const validateOperationOptions = (operationOptions?: OperationOptions) => {
  if (!isNil(operationOptions) && get(operationOptions, 'maxRequestCount', 0) <= 0) {
    throw new ValidationError('maxRequestCount has to be greater than 0.')
  }

  if (!isNil(operationOptions) && get(operationOptions, 'requestWindowMs', 0) <= 0) {
    throw new ValidationError('requestWindowMs has to be greater than 0.')
  }
}

const createLimiter = (type: LimiterType, operationOptions?: OperationOptions) => {
  validateOperationOptions(operationOptions)
  if (type) {
    return new limiterSwitch[type](operationOptions)
  }
}

export default createLimiter
