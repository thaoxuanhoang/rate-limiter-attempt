export interface State {
  tokenCount: number
  tokenAddedTimestamp: number
}

const state = new Map()

const getState = async (key: string): Promise<State> => {
  return state.get(key)
}

const updateState = async (key: string, oldState: State, newState: State) => {
  if (state.get(key) !== oldState) {
    throw new Error('Multiple tokens are fetched simultaneously.')
  }

  state.set(key, newState)
}

const deleteState = async (key: string): Promise<boolean> => {
  return state.delete(key)
}

export default {
  getState,
  updateState,
  deleteState,
}
