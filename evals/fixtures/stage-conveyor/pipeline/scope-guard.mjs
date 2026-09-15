export function requireValue(value) {
  if (value === undefined || value === null) throw new Error('scope guard: value is required')
  return value
}
