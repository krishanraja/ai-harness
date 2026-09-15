import { requireValue } from './scope-guard.mjs'

export const capture = input => ({ captured: requireValue(input) })
