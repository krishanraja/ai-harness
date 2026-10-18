/**
 * Redaction for anything that leaves a machine: one set of patterns, tested.
 *
 * The session miner reads Krish's own transcripts on his own machine. Before a
 * model sees any excerpt, and again before any observation leaves, the text goes
 * through redact(). It removes:
 *
 *   secrets      the five high-confidence patterns scripts/Test-Harness.ps1 and
 *                scripts/Export-DecisionLedgerSnapshot.ps1 already use (kept
 *                byte-identical, checked by scripts/test-redact.mjs), plus the
 *                families those miss: Anthropic and OpenAI keys, AWS, Slack,
 *                private key blocks, Bearer tokens, credentials in URLs,
 *                key=value secrets and long high-entropy strings
 *   identities   email addresses, @handles, and names: words on a local names
 *                list, and capitalised word pairs not on the allowlist
 *   locations    machine paths (Windows drives, home directories) and URL
 *                query strings
 *
 * It is deliberately aggressive. A lost word costs a slightly vaguer lesson; a
 * leaked secret or a client's name in a public repository costs far more.
 */

/** Byte-identical to the PowerShell sets. Do not edit one without the others. */
export const POWERSHELL_PATTERNS = {
  GitHubToken: '\\bgh(?:p|o|u|s|r)_[A-Za-z0-9]{20,}\\b',
  VercelToken: '\\bvcp_[A-Za-z0-9_-]{20,}\\b',
  SupabaseToken: '\\bsbp_[A-Za-z0-9_-]{20,}\\b',
  GenericSecretKey: '\\bsk_(?:user_)?[A-Za-z0-9_-]{20,}\\b',
  Jwt: '\\beyJ[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\b',
}

const EXTRA_SECRETS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g,
  /\bsk-(?:ant|proj|live|test)-[A-Za-z0-9_-]{12,}/gi,
  /\bsk-[A-Za-z0-9]{32,}\b/g,
  /\bA(?:KIA|SIA)[A-Z0-9]{16}\b/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/g,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi,
  /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/gi,
  /\b(?:password|passwd|pwd|secret|token|api[_-]?key|access[_-]?key|client[_-]?secret)\b\s*[:=]\s*["']?[^\s"',;]+/gi,
]

// Long strings that look like keys: 32 or more of base64 or hex, with a digit.
const HIGH_ENTROPY = /\b(?=[A-Za-z0-9+/_=-]{32,}\b)(?=[^\s]*\d)[A-Za-z0-9+/_=-]{32,}\b/g

const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
const HANDLE = /(^|[\s(])@[A-Za-z0-9_][A-Za-z0-9_-]{1,38}\b/g
const WINDOWS_PATH = /\b[A-Za-z]:\\(?:[^\s\\"'<>|]+\\?)*/g
const HOME_PATH = /(?:~|\/(?:home|Users|root))(?:\/[^\s"'<>|]+)*/g
const QUERY = /(https?:\/\/[^\s?#"'<>]+)\?[^\s#"'<>]*/gi

/** Words that look like names but are product, venture or tool names. */
export const DEFAULT_ALLOW = new Set([
  'Krish', 'Raja', 'Krish Raja', 'Mindmake', 'Heartside', 'Full Time', 'Legibility', 'CTRL', 'Pulse', 'Circle', 'Hunter',
  'Control Center', 'Control Centre', 'Claude', 'Claude Code', 'Claude Desktop', 'Codex', 'Cursor', 'ChatGPT', 'Perplexity',
  'GitHub', 'GitHub Actions', 'Supabase', 'Vercel', 'Substack', 'YouTube', 'TikTok', 'Instagram', 'Shorts', 'Google Drive',
  'Pull Request', 'Windows', 'Node', 'PowerShell', 'Make Your Mind Up', 'Content Engine', 'Video Engine',
])

/**
 * Remove secrets, identities and locations. `names` is a local list of people's
 * names (never committed); `allow` extends the allowlist of capitalised phrases.
 */
export function redact(text, { names = [], allow = [] } = {}) {
  let s = String(text ?? '')
  for (const src of Object.values(POWERSHELL_PATTERNS)) s = s.replace(new RegExp(src, 'gi'), '[secret]')
  for (const re of EXTRA_SECRETS) s = s.replace(re, '[secret]')
  s = s.replace(QUERY, '$1')
  s = s.replace(EMAIL, '[email]')
  s = s.replace(WINDOWS_PATH, '[path]').replace(HOME_PATH, '[path]')
  s = s.replace(HANDLE, '$1[handle]')
  s = s.replace(HIGH_ENTROPY, '[secret]')
  for (const n of names) {
    const t = String(n).trim()
    if (t.length >= 2) s = s.replace(new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '[person]')
  }
  const ok = new Set([...DEFAULT_ALLOW, ...allow])
  // Two or three capitalised words in a row, not at a sentence start, read as a name.
  s = s.replace(/(?<![.!?]\s|^)\b([A-Z][a-z]{1,20}(?:\s[A-Z][a-z]{1,20}){1,2})\b/gm, (m) => (ok.has(m) || [...ok].some((a) => m.startsWith(a) || a.startsWith(m)) ? m : '[person]'))
  return s
}

/** True when text still carries anything redact() exists to remove. */
export function leaks(text, opts = {}) {
  return redact(text, opts) !== String(text ?? '') ? true : false
}
