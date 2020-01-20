import { isNil, get } from 'lodash'
import { State } from './stateStore'
import { OperationOptions } from '../limiterFactory'

export const DEFAULT_BUCKET_CAPACITY = 100
export const DEFAULT_REQUEST_WINDOW = 60 * 60 * 1000 // 1 hour

export class Bucket {
  private _capacity: number
  private _newTokenIntervalMs: number

  get capacity(): number {
    return this._capacity
  }

  get newTokenIntervalMs(): number {
    return this._newTokenIntervalMs
  }

  constructor(operationOptions?: OperationOptions) {
    this._capacity = get(operationOptions, 'maxRequestCount') || DEFAULT_BUCKET_CAPACITY
    this._newTokenIntervalMs = (get(operationOptions, 'requestWindowMs') || DEFAULT_REQUEST_WINDOW) / this._capacity
  }

  private calculateGeneratedTokens(lastTimestamp: number, currentTimestamp: number) {
    return Math.max(Math.floor((currentTimestamp - lastTimestamp) / this._newTokenIntervalMs), 0)
  }

  private createNewState(currentTimestamp: number): State {
    return {
      tokenCount: this._capacity,
      tokenAddedTimestamp: currentTimestamp,
    }
  }

  private fillToken(currentState: State, currentTimestamp: number): State {
    const numOfGeneratedTokens = this.calculateGeneratedTokens(currentState.tokenAddedTimestamp, currentTimestamp)
    const newTokenCount = Math.min(currentState.tokenCount + numOfGeneratedTokens, this._capacity)

    let newTimestamp: number
    if (numOfGeneratedTokens > 0) {
      newTimestamp = newTokenCount < this._capacity ?
        currentState.tokenAddedTimestamp + numOfGeneratedTokens * this._newTokenIntervalMs :
        currentTimestamp
    } else {
      newTimestamp = currentState.tokenAddedTimestamp
    }

    return { tokenCount: newTokenCount, tokenAddedTimestamp: newTimestamp }
  }

  public calibrateState(currentState: State | undefined, currentTimestamp: number): State {
    return isNil(currentState) ?
      this.createNewState(currentTimestamp) :
      this.fillToken(currentState, currentTimestamp)
  }

  public nextConsumableTimestamp(currentState: State, currentTimestamp: number): number {
    if (currentState.tokenCount > 0) {
      return currentTimestamp
    }

    if (currentState.tokenAddedTimestamp + this._newTokenIntervalMs <= currentTimestamp) {
      return currentTimestamp
    }

    return currentState.tokenAddedTimestamp + this._newTokenIntervalMs
  }
}
