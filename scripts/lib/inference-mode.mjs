/** Explicit cutover only. An unknown setting must never restore a legacy route. */
export function boundedInference(env = process.env) {
  const mode = env.HARNESS_INFERENCE_MODE || 'legacy'
  if (!['legacy', 'bounded-api'].includes(mode)) throw new Error('inference_mode_invalid')
  return mode === 'bounded-api'
}
