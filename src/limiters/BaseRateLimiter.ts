export default interface BaseRateLimiter {
  operate(operatorId: string): Promise<void>
  reset(operatorId: string): void
}
