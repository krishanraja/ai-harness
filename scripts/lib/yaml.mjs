/**
 * Minimal YAML reader for the harness state files.
 *
 * Dependency-free on purpose, the same rule the docs steward follows: a broken
 * lockfile must never be the reason the canon goes unrendered. It reads the
 * subset this repository actually writes, which is nested maps, lists of
 * scalars, lists of maps, inline [a, b] lists, and quoted or bare scalars.
 * Anything outside that subset throws with a line number rather than guessing.
 */

const scalar = (raw) => {
  const s = raw.trim()
  if (s === '' ) return ''
  if (s === 'null' || s === '~') return null
  if (s === 'true') return true
  if (s === 'false') return false
  if (/^-?\d+$/.test(s)) return Number(s)
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1)
  if (s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1, -1).trim()
    return inner === '' ? [] : inner.split(',').map((p) => scalar(p))
  }
  return s
}

// Strip a trailing comment, but only when the # is not inside quotes.
const decomment = (line) => {
  let quote = null
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (quote) { if (c === quote) quote = null; continue }
    if (c === '"' || c === "'") { quote = c; continue }
    if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i)
  }
  return line
}

export function parseYaml(text) {
  const lines = text.split('\n').map((l, i) => ({ n: i + 1, raw: l }))
    .map((l) => ({ ...l, body: decomment(l.raw).replace(/\s+$/, '') }))
    .filter((l) => l.body.trim() !== '')

  let pos = 0

  const indentOf = (l) => l.body.length - l.body.trimStart().length

  function parseBlock(indent) {
    const first = lines[pos]
    if (!first) return null
    if (first.body.trimStart().startsWith('- ')) return parseList(indent)
    return parseMap(indent)
  }

  function parseList(indent) {
    const out = []
    while (pos < lines.length) {
      const l = lines[pos]
      if (indentOf(l) < indent) break
      const t = l.body.trimStart()
      if (indentOf(l) !== indent || !t.startsWith('- ')) break
      pos++
      const rest = t.slice(2)
      if (/^[A-Za-z0-9_.-]+:(\s|$)/.test(rest)) {
        // A list item that opens a map. Re-read it as a map line at the item indent.
        const itemIndent = indent + 2
        lines.splice(pos, 0, { n: l.n, raw: l.raw, body: ' '.repeat(itemIndent) + rest })
        out.push(parseMap(itemIndent))
      } else {
        out.push(scalar(rest))
      }
    }
    return out
  }

  function parseMap(indent) {
    const out = {}
    while (pos < lines.length) {
      const l = lines[pos]
      const li = indentOf(l)
      if (li < indent) break
      const t = l.body.trimStart()
      if (t.startsWith('- ')) break
      const m = t.match(/^([^:]+):(.*)$/)
      if (!m) throw new Error(`yaml: line ${l.n}: not a key, not a list item: ${t}`)
      if (li > indent) throw new Error(`yaml: line ${l.n}: unexpected indent`)
      pos++
      const key = m[1].trim()
      const inline = m[2].trim()
      if (inline !== '') { out[key] = scalar(inline); continue }
      const next = lines[pos]
      if (!next || indentOf(next) <= indent) { out[key] = null; continue }
      out[key] = parseBlock(indentOf(next))
    }
    return out
  }

  const firstIndent = lines.length ? indentOf(lines[0]) : 0
  return parseBlock(firstIndent) ?? {}
}
