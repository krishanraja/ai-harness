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

  /** Move a branch to a commit, discarding what was on it. */
  async resetBranch(repo, branch, sha) {
    if (this.dryRun) return { dryRun: true }
    return this.req('PATCH', `/repos/${this.owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, { sha, force: true })
  }

  async putFile(repo, path, text, { branch, message, sha }) {
    if (this.dryRun) return { dryRun: true }
    return this.req('PUT', `/repos/${this.owner}/${repo}/contents/${encodeURI(path)}`, {
      message, branch, content: Buffer.from(text, 'utf8').toString('base64'), ...(sha ? { sha } : {}),
    })
  }

  /** One multi-file commit, with a non-forced ref update. A moved head fails instead of losing work. */
  async commitFiles(repo, branch, parent, files, message) {
    if (this.dryRun) return { sha: parent, dryRun: true }
    if (await this.headSha(repo, branch) !== parent) throw new Error('write_head_moved')
    const commit = await this.req('GET', `/repos/${this.owner}/${repo}/git/commits/${parent}`)
    const tree = []
    for (const [path, text] of Object.entries(files)) {
      if (text === null) { tree.push({ path, mode: '100644', type: 'blob', sha: null }); continue }
      const blob = await this.req('POST', `/repos/${this.owner}/${repo}/git/blobs`, { content: text, encoding: 'utf-8' })
      tree.push({ path, mode: '100644', type: 'blob', sha: blob.sha })
    }
    const nextTree = await this.req('POST', `/repos/${this.owner}/${repo}/git/trees`, { base_tree: commit.tree.sha, tree })
    const next = await this.req('POST', `/repos/${this.owner}/${repo}/git/commits`, { message, tree: nextTree.sha, parents: [parent] })
    await this.req('PATCH', `/repos/${this.owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, { sha: next.sha, force: false })
    return next
  }

  /**
   * Pull requests, including merged and closed ones.
   *
   * findPull below asks for state=open only, which is right for "is there
   * already a branch open for this", and useless for "what happened to the
   * proposal we opened last week". A merged pull request is invisible to it.
   */
  async listPulls(repo, { state = 'all', head = null, base = null, per_page = 100 } = {}) {
    const q = [`state=${state}`, `per_page=${per_page}`]
    if (head) q.push(`head=${this.owner}:${head}`)
    if (base) q.push(`base=${base}`)
    return this.req('GET', `/repos/${this.owner}/${repo}/pulls?${q.join('&')}`)
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

  async openPull(repo, { title, head, base, body, draft = false }) {
    if (this.dryRun) return { dryRun: true, html_url: '(dry run)' }
    return this.req('POST', `/repos/${this.owner}/${repo}/pulls`, { title, head, base, body, ...(draft ? { draft: true } : {}) })
  }

  /** Every open pull request, paged. */
  async openPulls(repo) {
    const out = []
    for (let page = 1; page <= 10; page++) {
      const r = await this.req('GET', `/repos/${this.owner}/${repo}/pulls?state=open&per_page=100&page=${page}`)
      out.push(...r)
      if (r.length < 100) break
    }
    return out
  }

  async closePull(repo, number) {
    if (this.dryRun) return { dryRun: true }
    return this.req('PATCH', `/repos/${this.owner}/${repo}/pulls/${number}`, { state: 'closed' })
  }

  async addLabels(repo, number, labels) {
    if (this.dryRun) return { dryRun: true }
    return this.req('POST', `/repos/${this.owner}/${repo}/issues/${number}/labels`, { labels })
  }

  /** Commit statuses (context -> state) and check runs for one sha. */
  async checksFor(repo, sha) {
    const status = await this.req('GET', `/repos/${this.owner}/${repo}/commits/${sha}/status`)
    const runs = await this.req('GET', `/repos/${this.owner}/${repo}/commits/${sha}/check-runs?per_page=100`)
    const statuses = Object.fromEntries((status.statuses || []).map((s) => [s.context, s.state]))
    return { statuses, runs: (runs.check_runs || []).map((r) => ({ name: r.name, status: r.status, conclusion: r.conclusion })) }
  }

  /** A draft pull request becomes ready for review. REST has no endpoint for it. */
  async markReady(nodeId) {
    if (this.dryRun) return { dryRun: true }
    return this.req('POST', 'https://api.github.com/graphql', {
      query: 'mutation($id: ID!) { markPullRequestReadyForReview(input: { pullRequestId: $id }) { pullRequest { number isDraft } } }',
      variables: { id: nodeId },
    })
  }
}
