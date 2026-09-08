/**
 * The smallest GitHub client the harness needs.
 *
 * Dependency-free: fetch is built in on Node 18 and later. It exists so the
 * reconciler can read and write ten repositories from one cloud job without a
 * machine, a checkout of every repo, or a package tree that can break the
 * schedule.
 *
 * Every call is explicit about which token it uses. There is exactly one
 * cross-repository credential (FLEET_TOKEN) and it is never printed, never
 * logged, and never written anywhere.
 */

const API = 'https://api.github.com'

export class Gh {
  constructor(token, { owner = 'krishanraja', dryRun = false } = {}) {
    if (!token) throw new Error('Gh: no token')
    this.token = token
    this.owner = owner
    this.dryRun = dryRun
  }

  async req(method, path, body) {
    const res = await fetch(path.startsWith('http') ? path : `${API}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${this.token}`,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28',
        'user-agent': 'krish-harness-steward',
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    let json = null
    try { json = text ? JSON.parse(text) : null } catch { /* not json */ }
    if (!res.ok) {
      const err = new Error(`${method} ${path} -> ${res.status} ${json?.message || text.slice(0, 200)}`)
      err.status = res.status
      throw err
    }
    return json
  }

  /** File content at a ref, or null when it does not exist. Never throws on 404. */
  async getFile(repo, path, ref) {
    try {
      const r = await this.req('GET', `/repos/${this.owner}/${repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(ref)}`)
      if (Array.isArray(r) || r.type !== 'file') return null
      return { sha: r.sha, text: Buffer.from(r.content, 'base64').toString('utf8') }
    } catch (e) {
      if (e.status === 404) return null
      throw e
    }
  }

  async defaultBranch(repo) {
    const r = await this.req('GET', `/repos/${this.owner}/${repo}`)
    return { branch: r.default_branch, fullName: r.full_name }
  }

  async headSha(repo, branch) {
    const r = await this.req('GET', `/repos/${this.owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`)
    return r.object.sha
  }

  async branchExists(repo, branch) {
    try { await this.headSha(repo, branch); return true } catch (e) { if (e.status === 404) return false; throw e }
  }

  async createBranch(repo, branch, fromSha) {
    if (this.dryRun) return { dryRun: true }
    return this.req('POST', `/repos/${this.owner}/${repo}/git/refs`, { ref: `refs/heads/${branch}`, sha: fromSha })
  }

  async putFile(repo, path, text, { branch, message, sha }) {
    if (this.dryRun) return { dryRun: true }
    return this.req('PUT', `/repos/${this.owner}/${repo}/contents/${encodeURI(path)}`, {
      message, branch, content: Buffer.from(text, 'utf8').toString('base64'), ...(sha ? { sha } : {}),
    })
  }

  async findPull(repo, head, base) {
    const r = await this.req('GET', `/repos/${this.owner}/${repo}/pulls?state=open&head=${this.owner}:${head}&base=${base}`)
    return r[0] || null
  }

  /** Open issues whose title starts with a marker, so proposals dedupe by target. */
  async findIssue(repo, titlePrefix) {
    const r = await this.req('GET', `/repos/${this.owner}/${repo}/issues?state=open&per_page=100`)
    return r.find((i) => !i.pull_request && i.title.startsWith(titlePrefix)) || null
  }

  async openIssue(repo, { title, body, labels }) {
    if (this.dryRun) return { dryRun: true, html_url: '(dry run)', number: 0 }
    return this.req('POST', `/repos/${this.owner}/${repo}/issues`, { title, body, ...(labels ? { labels } : {}) })
  }

  async comment(repo, number, body) {
    if (this.dryRun) return { dryRun: true }
    return this.req('POST', `/repos/${this.owner}/${repo}/issues/${number}/comments`, { body })
  }

  async openPull(repo, { title, head, base, body }) {
    if (this.dryRun) return { dryRun: true, html_url: '(dry run)' }
    return this.req('POST', `/repos/${this.owner}/${repo}/pulls`, { title, head, base, body })
  }
}
