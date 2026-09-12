# n8n provider sources and freshness

Last evidence review: 2026-09-12.

Use official n8n documentation as the primary source for current product, API, node, execution, source-control, and security-audit behavior:

- Documentation index: https://docs.n8n.io/
- Public API: https://docs.n8n.io/api/
- Executions: https://docs.n8n.io/workflows/executions/all-executions/
- Security audit: https://docs.n8n.io/hosting/securing/security-audit/
- Source-control environments: https://docs.n8n.io/source-control-environments/

Before relying on a provider-specific claim, record the exact page, retrieval time, tenant/version when observable, and whether the feature is plan- or deployment-specific. Confirm node parameters from the installed node schema or official node documentation.

Do not treat a third-party CLI's command list as the n8n contract. Verify that the tool is installed, reviewed, authenticated to the intended tenant, and supports the named operation. Destructive CLI commands remain approval-gated even when listed by the tool.
