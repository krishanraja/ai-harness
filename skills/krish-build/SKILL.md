---
name: krish-build
description: "Krish's build-and-ship doctrine, the layer above individual tool skills. Use before writing code, running a build pipeline, deploying, committing, handling secrets or keys, wiring data, or shipping a technical artifact for Krish. Trigger on: 'build this', 'deploy', 'ship it', 'commit', 'edge function', 'migration', 'run the pipeline', 'set this up', 'wire this', 'secrets', 'API key', 'why did this fail', 'it ran but nothing happened', file delivery of .docx/.pptx/.html builds, or multi-step technical execution. Covers determinism, idempotency, build gates, runtime-only secrets, programmatic validation, targeted repair, and environment truth. Load krish-principles first. Use tools-access for secure authentication and a reviewed per-tool skill for API mechanics. Last reviewed 2026-08-05."
---

# Krish Build: How It Gets Built and Shipped

The cross-cutting layer above the tool skills. Inherits krish-principles; read that first. Authentication rules live in tools-access and API specifics live in reviewed per-tool skills; this file never stores a credential or re-documents an endpoint.

Stability tags per krish-principles: [LOAD-BEARING] is stable conviction, [IN-PLAY] is actively tested or an environment quirk that may expire.

---

## 1. Build doctrine

**Harness first; judgment is the moat.** [LOAD-BEARING]
Build the scaffolding (skills, prompts, tools, validation) so the scarce asset, judgment, gets spent on decisions rather than re-explanation. Any recurring instruction is a candidate for codification. This file exists because of this rule.

**Determinism and idempotency.** [LOAD-BEARING]
Reproducibility over cleverness. Builds run the same way twice; writes are idempotent; every state change is auditable. If re-running a step would double-apply anything, the pipeline is broken (see section 2).

**One source of truth.** [LOAD-BEARING]
State lives in one place (Supabase for the fleet; a single canonical source file for a build). No per-agent local state, no local JSON shadows, no two files that both claim to be current. One bare URL over per-user URL generation: attribution comes from the capture, not the link. Rejecting a tool because its state model conflicts with the SSOT is a valid and sufficient reason.

**Plan first, gate hard.** [LOAD-BEARING]
Substantial builds open with a plan and a Phase 0 gate: a cheap check that validates the premise before anything is written. If the gate fails (the success-detection query returns no wins, the data is not there, the connector is down), the build stops at the gate. Later phases can be spec-only in the current session to prevent scope creep; say so explicitly.

**Right-sized tooling.** [LOAD-BEARING]
Reject anything that adds a paradigm without earning it. A system already running two orchestration paradigms does not get a third for marginal gain. Evaluate new tools with the ranked table from krish-principles, and prefer the contained test (one agent, one cheap VPS, two weeks) over the migration.

**Test small before you scale.** [LOAD-BEARING]
10 to 100 rows before the full run. A 30-minute spike before a migration. Cap every metered operation (maxItems or equivalent) so a runaway job cannot bill at scale. Dedup before running anything paid.

**Learn from wins, not just losses.** [IN-PLAY]
Correction loops that fire only on failure are half a loop. When something works, capture why (a pattern, a skill candidate, a reusable engine) through the same proposal-and-approval lane as fixes.

---

## 2. Determinism in practice

**Never re-run the assembler.** [LOAD-BEARING]
When a build has an assembly step that applies edits (an assemble.py, a merge script), re-running it double-applies edits and can crash silently. Once assembled, all edits go directly to the canonical output source (the current vN.html), which is then copied to outputs. Identify which file is the source of truth at the start of any session touching an existing build, and state it.

**Presenting is a separate step from creating.** [LOAD-BEARING]
create_file writes to disk; present_files puts it in front of Krish. They are two explicit steps, always. The proven failure: a file written but not presented, and Krish reacting to the previous version. Never end a build turn without presenting the current file.

**Version by copy, not by mutation ambiguity.** [IN-PLAY]
When iterating a document (v6 to v7), the new version is a new file with the version in the name, validated, and the old version stops being edited. Two files both receiving edits is the SSOT violation in miniature.

---

## 3. Data and secrets

**Publishable on the page, service-role never.** [LOAD-BEARING]
Static pages authenticate with the publishable key only. The service-role key is platform-injected into functions and never appears in page-side code, chat, or committed files. This decouples pages from secret rotation.

**Anything pasted gets rotated.** [LOAD-BEARING]
A live secret pasted into a session is compromised by default. Flag it at the moment it appears, keep a value-free list of affected credential families and locations, and close the session with the rotation reminder. Secrets and private infrastructure details never go into memory files or skill files; they belong in the approved managed secret store and follow the tools-access contract.

**curl over Python urllib for Cloudflare-fronted hosts.** [IN-PLAY]
Cloudflare blocks urllib (1010) where curl passes. Build JSON with Python, transport with curl. Sites blocking curl too (403 behind Cloudflare) need a different route entirely (an API, a sibling property on the same codebase, or a scraper actor per the apify skill).

**Trust the body, not the status code.** [LOAD-BEARING]
The green-checkmark rule from krish-principles, applied: HTTP 200 wrapping an HTML error page, an ads.txt that is really a 404 page, a SUCCEEDED run with an empty dataset. Read the first lines of the actual response body before believing any check passed.

**Atomic multi-file commits.** [IN-PLAY]
Multi-file changes commit atomically (Git Data API pattern: blobs, tree, commit, ref) rather than as a sequence of single-file commits that can land half-done.

---

## 4. Gates and validation

**Validate programmatically, not by eye.** [LOAD-BEARING]
Anything with hard constraints gets a script: character counts against field limits, kill-list scans (banned words, em dashes) across every field, count-of-fields audits, page-count checks on PDFs, rendered-image verification of visual output. The standard for copy documents at scale: write to outputs, then run the validation script, then report the numbers. "Looks right" is not validation.

**Never rebuild for a one-line change.** [LOAD-BEARING]
A single-sentence edit to a built artifact gets the updated text pasted in chat (or a surgical str_replace), never a full rebuild. Rebuilding burns time, risks regressions, and signals the pipeline is not deterministic. The corollary: surgical edits to live assets pull the actual live file first and replace only the target blocks, leaving working code untouched.

**Briefs are claims; live state is truth.** [LOAD-BEARING]
When a brief, a memory, or a summary contradicts the live system (the actual file, the actual table, the actual page), the live state wins and the contradiction gets flagged. Do not reconstruct from memory what can be read from disk, and never imply a file was read when it was not. If access fails, say so before proceeding, not after being caught.

**Deliverables ship external-ready.** [LOAD-BEARING]
A file marked done has no placeholders, no internal notes, no stale claims, and has passed the visual QA scan (krish-design section 7). Filesystem-safe filenames: no colons, replace with dashes.

**Use the app-runtime proof patterns when the boundary is fragile.** [LOAD-BEARING]
Read `references/app-runtime-verification.md` when work involves a remote database mutation, a component fixture-render harness, an authenticated user path, an edge or serverless function, SPA shell caching, or a build-time environment flag. It supplies bounded procedures and evidence requirements; it never grants production authority or replaces a current provider-specific tool reference.

---

## 5. Environment truth

Facts about Krish's environment. All [IN-PLAY] by nature: re-verify any of these that look stale, and update this section when one expires.

- **OS**: Windows, with Claude Code via WSL. Repos and working paths are WSL Linux paths, never Windows paths.
- **VPS**: use the configured SSH alias and key authentication. Resolve current host, user, and privilege details from the approved runtime configuration; never restate credentials here.
- **Shell in this environment**: dash, not bash. No here-strings. Check before using bashisms.
- **No em dashes anywhere, including code.** Comments, strings, generated copy inside code, skill text: everywhere. This is [LOAD-BEARING], not environmental.
- **Google Drive connector is unreliable for this user** (persistent -32000 errors and permission-blocked fetches in the record). Do not build a plan that depends on Drive reads or writes. Deliver .docx to /mnt/user-data/outputs and Krish drags into Drive; fonts (Space Grotesk, Inter, JetBrains Mono) resolve from the Google Fonts catalog on import. Confirm the connector is restored before trusting it again.
- **localStorage silently fails in artifact sandboxes.** Use the environment's persistent storage API in artifacts; state the substitution when the spec asked for localStorage.
- **Document builds**: docx via the established build-script pattern with programmatic validation and a rendered check before delivery. Consult the public docx, pptx, pdf skills for mechanics.
- **Distribution of these skills**: build versioned artifacts from the canonical private repository and verify their hashes on each surface. MCPMarket is an optional distribution target, not the source of truth; its private GitHub auto-sync currently depends on plan capability. Cloud uploads and enable/disable changes require approval.

---

## 6. Cross-references

- **krish-principles**: the doctrine this file applies, including the green-checkmark rule and test-small.
- **krish-design**: what the artifact should look like and the visual QA scan; this file covers how it gets built and shipped.
- **tools-access**: the runtime-only authentication contract. It contains no credential values and is the first stop for authenticated calls.
- **mindmaker-os**: live fleet, n8n, deployment, and operational-state routing.
- **apify**: reviewed Apify mechanics. Load other per-tool skills only after provenance and security review.
- **code-reviewer**: post-build review standards for React and Supabase work.
- **mindmaker-os**: architecture facts (SSOT, model tiering, approval lanes). Never restate its canon.
