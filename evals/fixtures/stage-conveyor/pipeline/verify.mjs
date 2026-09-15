import { requireValue } from './scope-guard.mjs'

export const verify = built => ({ verified: requireValue(built) })
