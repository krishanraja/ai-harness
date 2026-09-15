import { requireValue } from './scope-guard.mjs'

export const build = captured => ({ built: requireValue(captured) })
export const resume = checkpoint => ({ built: requireValue(checkpoint) })
