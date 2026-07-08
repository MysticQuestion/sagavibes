# SagaVibes Integration Strategy

## Integration rule

Prefer, in order:

1. documented service API or SDK;
2. documented MCP interface;
3. GitHub synchronization or repository handoff;
4. CLI executed inside an isolated worker;
5. user-assisted deep link or launch URL;
6. browser automation only for non-critical workflows after contractual and operational review.

Browser automation must never become the core delivery substrate for SagaVibes. Selectors change, authentication challenges interrupt runs, platform terms may restrict automation, and a GUI session is difficult to make idempotent.

## Provider adapters

Every provider implements a normalized interface:

```text
ModelAdapter
  capabilities() -> CapabilitySet
  estimate(task, context) -> CostEstimate
  execute(TaskEnvelope) -> RunResult
  cancel(run_id)
  health() -> ProviderHealth
```

A `TaskEnvelope` contains:

```json
{
  "task_id": "task_01...",
  "project_id": "uuid",
  "task_type": "architecture.design",
  "context_bundle_id": "ctx_01...",
  "input_artifact_refs": [],
  "required_output_schema": "schema://architecture-plan/v1",
  "budget": {
    "max_cost_usd": 4.5,
    "max_input_tokens": 120000,
    "max_output_tokens": 12000
  },
  "freshness": {
    "requires_live_web": false
  },
  "permissions": ["read:prd", "read:research", "write:architecture-proposal"]
}
```

A `RunResult` must return structured output, usage, artifacts, evidence references, and retry metadata.

## Model roles

### OpenAI

Primary use: conversational intake, requirement clarification, customer-facing progress synthesis, structured task classification, and selected implementation/review tasks.

Do not store the project solely in conversation state. Persist normalized discoveries and decisions in SagaVibes.

### Anthropic Claude

Primary use: architecture plans, backend decomposition, high-complexity implementation tasks, design reviews, and contradiction analysis.

Claude receives architecture-specific context packs, not the entire history of the product.

### Gemini

Primary use: large-context synthesis across PRD, research, architecture records, repository maps, and decision history.

Gemini produces compressed role-specific summaries and conflict reports. These outputs are artifacts, not canonical truth until validated.

### Perplexity

Primary use: research requests requiring source discovery and time-sensitive external evidence.

The adapter stores query, response, citations, retrieval timestamp, and freshness policy. Research claims are normalized into proposed facts before they enter canonical context.

### xAI / Grok

Primary use: real-time pulse, web/X signal collection where relevant, competitive chatter, developer ecosystem signals, and secondary research triangulation.

Social signals must be tagged separately from verified facts.

### DeepSeek

Primary use: cost-sensitive extraction, transformation, fixture generation, synthetic data, test-case expansion, repetitive code migration, and bulk classification.

Never send it a giant project context merely because it is cheaper. Context discipline is a first-order cost control.

### Llama

Primary use: self-hosted or deployment-selectable local/private inference for classification, summarization, redaction, test generation, and tenant-sensitive workflows.

The adapter must target an OpenAI-compatible internal gateway where possible so the underlying runtime can change without altering orchestration code.

## Builder integrations

### Lovable

Preferred path: documented MCP tools where authentication and client support permit. Use for project creation, iterative messages, code inspection, diffs, and optional deployment.

Fallback path: user-assisted Build-with-URL handoff for rapid project creation.

Important boundary: the OAuth model for the MCP service must be treated as an account-scoped privileged integration. SagaVibes should not assume a custom unattended backend can impersonate a supported client. For a commercial service, negotiate a service-authentication arrangement or provide a user-authorized supported-client workflow.

### Emergent

Use GitHub as the interchange boundary:

```text
SagaVibes brief + project contract
  -> user/enterprise Emergent session
  -> generated code
  -> GitHub repository or branch
  -> SagaVibes validation and hardening lane
```

Do not make an undocumented GUI session the canonical execution path. If a documented enterprise API becomes contractually available, hide it behind the same adapter interface.

### Replit

Treat Replit Agent as an interactive execution environment and optional publishing lane unless a documented account-appropriate API is available for the required operation.

Preferred integration:

```text
SagaVibes -> GitHub task branch -> Replit import/agent session -> GitHub push -> SagaVibes CI
```

This preserves repository traceability and keeps the orchestrator from depending on UI selectors.

### Base44

Use Base44 through its developer surfaces: GitHub integration, JavaScript SDK/CLI where appropriate, and OpenAPI-based external integrations.

Base44 can be a build lane or backend service option. It must not become the master project database.

## Developer integrations

### GitHub

GitHub is the canonical source-code control plane.

SagaVibes creates:

- one repository or selected monorepo target per product;
- branches per bounded task;
- issues or internal tasks linked to task graph nodes;
- pull requests with machine-readable metadata;
- CI checks before merge;
- release tags and deployment provenance.

### GitHub Codespaces

Use the documented lifecycle API for creating, starting, stopping, and deleting development environments. The orchestrator should create environments only when required, attach them to the task lease, and shut them down at task completion or timeout.

### Codex

Use the SDK or non-interactive execution mode inside controlled workers. Give Codex a bounded task, repository ref, test command, allowed paths, and acceptance criteria.

### GitHub Copilot cloud agent

Use repository-native task assignment and pull-request workflows for bounded engineering tasks. Treat output as proposed code changes that must pass SagaVibes policy and CI gates.

## Deployment integration

### Vercel

Use Git integration for the normal preview flow and the REST API for explicit deployment operations, domain management, environment configuration, and deployment inspection.

Recommended policy:

```text
pull request -> automatic preview
preview checks -> human approval
merge main -> production deployment
post-deploy smoke tests -> healthy or rollback/escalate
```

Long-running orchestration workers should run outside the web frontend deployment. Keep the React control plane deployable independently from workflow workers.

## Browser automation fallback

Where no supported integration exists, a Playwright adapter may be used only if the use case is permitted and operationally justified.

Required controls:

- feature flag per platform;
- isolated browser context per run;
- secrets injected through a vault, never placed in agent prompts;
- durable step checkpoints;
- screenshots and DOM snapshots on failure;
- selector versioning;
- idempotency key attached to the logical operation;
- human takeover path;
- hard timeout and spend ceiling;
- automatic disable after repeated selector/auth failures.

The strategic goal is to remove these adapters over time, not expand them.
