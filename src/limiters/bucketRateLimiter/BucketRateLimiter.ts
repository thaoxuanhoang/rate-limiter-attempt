import stateStore from './stateStore'
import BaseRateLimiter from '../BaseRateLimiter'
import { OperationOptions } from '../limiterFactory'
import { Bucket } from './Bucket'
import { LimitExceededError } from '../errors'

export default class BucketRateLimiter implements BaseRateLimiter {
  private bucket: Bucket

  constructor(operationOptions?: OperationOptions) {
    this.bucket = new Bucket(operationOptions)
  }

  async operate(operatorId: string): Promise<void> {
    const currentTime = Date.now()
    const currentBucketState = await stateStore.getState(operatorId)
    const newBucketState = this.bucket.calibrateState(currentBucketState, currentTime)

    if (newBucketState.tokenCount > 0) {
      await stateStore.updateState(operatorId, currentBucketState,
        { ...newBucketState, tokenCount: newBucketState.tokenCount - 1 })
    } else {
      throw new LimitExceededError(
        (this.bucket.nextConsumableTimestamp(newBucketState, currentTime) - currentTime) / 1000)
    }
  }

  async reset(operatorId: string): Promise<void> {
    await stateStore.deleteState(operatorId)
  }
}
