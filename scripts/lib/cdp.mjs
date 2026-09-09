/**
 * A very small Chrome DevTools Protocol client.
 *
 * Dependency-free, because this repository is: "a broken lockfile must never be
 * the reason the canon goes unrendered" is the rule the renderer, the validator
 * and the observer all follow, and a browser automation library is a large
 * dependency to break that rule for. Node 22 has fetch and WebSocket built in,
 * and the handful of commands needed here are a thin layer over both.
 *
 * It connects to a Chrome that is ALREADY RUNNING and already signed in. It
 * never launches one, never creates a profile, and never sees a credential.
 * That is the whole security design of the cloud upload: Krish opens his own
 * browser, and the script borrows the tab.
 *
 *   chrome.exe --remote-debugging-port=9222 --user-data-dir=<a dedicated profile>
 *
 * Nothing here stores, logs or returns a cookie, a token or a page image.
 */

/** Targets the browser is willing to talk about. */
export async function listTargets(port = 9222, host = '127.0.0.1') {
  const res = await fetch(`http://${host}:${port}/json/list`, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) throw new Error(`CDP ${res.status} from ${host}:${port}. Is Chrome running with --remote-debugging-port=${port}?`)
  return res.json()
}

export async function browserVersion(port = 9222, host = '127.0.0.1') {
  const res = await fetch(`http://${host}:${port}/json/version`, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) throw new Error(`CDP ${res.status} asking for the browser version`)
  return res.json()
}

/**
 * One page, one socket.
 *
 * Every call is bounded. An unbounded wait on a browser is the same failure as
 * an unbounded model call: it holds everything and says nothing, and the run
 * looks alive right up until someone kills it.
 */
export class Page {
  constructor(ws, { timeoutMs = 30000 } = {}) {
    this.ws = ws
    this.timeoutMs = timeoutMs
    this.nextId = 1
    this.pending = new Map()
    this.ws.addEventListener('message', (ev) => {
      let msg
      try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data)) } catch { return }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject, timer } = this.pending.get(msg.id)
        clearTimeout(timer)
        this.pending.delete(msg.id)
        if (msg.error) reject(new Error(`${msg.error.message || 'CDP error'}`))
        else resolve(msg.result)
      }
    })
  }

  static async open(webSocketDebuggerUrl, opts = {}) {
    const ws = new WebSocket(webSocketDebuggerUrl)
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timed out opening the debugger socket')), opts.timeoutMs || 15000)
      ws.addEventListener('open', () => { clearTimeout(timer); resolve() }, { once: true })
      ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('could not open the debugger socket')) }, { once: true })
    })
    return new Page(ws, opts)
  }

  send(method, params = {}) {
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`${method} did not answer within ${this.timeoutMs}ms`))
      }, this.timeoutMs)
      this.pending.set(id, { resolve, reject, timer })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  /** Evaluate an expression in the page and return its value. */
  async evaluate(expression) {
    const r = await this.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true,
    })
    if (r.exceptionDetails) throw new Error(`page threw: ${r.exceptionDetails.text || 'unknown'}`)
    return r.result?.value
  }

  async navigate(url) {
    await this.send('Page.enable')
    await this.send('Page.navigate', { url })
  }

  async url() { return this.evaluate('location.href') }

  /**
   * Wait for an expression to become truthy. Polling rather than event driven
   * on purpose: it is a few lines instead of a lifecycle state machine, and the
   * pages this drives are ordinary applications, not races.
   */
  async waitFor(expression, { timeoutMs = 20000, everyMs = 400 } = {}) {
    const until = Date.now() + timeoutMs
    for (;;) {
      let v = null
      try { v = await this.evaluate(expression) } catch { /* a page mid navigation throws; keep waiting */ }
      if (v) return v
      if (Date.now() > until) return null
      await new Promise((r) => setTimeout(r, everyMs))
    }
  }

  close() { try { this.ws.close() } catch { /* already gone */ } }
}
