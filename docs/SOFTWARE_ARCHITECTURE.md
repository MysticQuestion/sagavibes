# SagaVibes Software Architecture

## 1. Purpose

SagaVibes is a multi-agent software factory. A customer supplies a business vision; the platform converts it into research artifacts, a PRD, architecture decisions, a task graph, code changes, tests, preview environments, and controlled production releases.

The orchestration layer is vendor-neutral. Providers are workers, not authorities over project state.

## 2. Architectural principles

1. **Canonical state lives in SagaVibes.** Model conversation history is never the system of record.
2. **Durable workflows, not request chains.** Long-running builds must survive retries, restarts, quotas, and human approval delays.
3. **GitHub is canonical for source code.** Builder platforms may scaffold code, but production changes return through branches and pull requests.
4. **Agents receive least-context bundles.** Send only the facts, requirements, code slices, and artifacts required for the current task.
5. **Agents propose changes.** They do not overwrite shared project state directly.
6. **Routing is auditable.** LLMs may extract signals; deterministic policy selects the delivery lane.
7. **Every external action is idempotent.** Deployment, repository, and builder adapters must carry operation IDs and retry safely.
8. **Human approval is a first-class workflow state.** Architecture, material scope changes, security exceptions, and production promotion require explicit gates.

## 3. Logical architecture

```text
[React/Vite Control Plane]
           |
           v
[FastAPI API Gateway + Auth]
           |
           v
[Project Service] ---- [PostgreSQL: canonical state + event log]
           |                         |
           |                         +---- [Object Store: large artifacts]
           v
[Durable Workflow Engine] ---- [Redis: cache, locks, quotas]
           |
           +---- [Context Builder / Retrieval]
           |
           +---- [Model Gateway]
           |       +-- OpenAI adapter
           |       +-- Anthropic adapter
           |       +-- Gemini adapter
           |       +-- Perplexity adapter
           |       +-- xAI adapter
           |       +-- DeepSeek adapter
           |       +-- Llama runtime adapter
           |
           +---- [Builder Adapters]
           |       +-- Lovable adapter
           |       +-- Emergent handoff adapter
           |       +-- Base44 adapter
           |       +-- Replit handoff adapter
           |
           +---- [Developer Adapters]
           |       +-- GitHub
           |       +-- Codespaces
           |       +-- Codex
           |       +-- Copilot agent
           |
           +---- [Validation Workers]
           |       +-- unit/integration tests
           |       +-- browser E2E
           |       +-- dependency/SAST/secret checks
           |       +-- architecture conformance
           |
           +---- [Deployment Adapter]
                   +-- Vercel preview/production
                   +-- workload-specific backend target
```

## 4. Workflow state machine

```text
DISCOVERY
  -> RESEARCH
  -> REQUIREMENTS
  -> ROUTING
  -> ARCHITECTURE
  -> APPROVAL_GATE_ARCHITECTURE
  -> GENERATION
  -> ASSEMBLY
  -> VALIDATION
  -> PREVIEW_DEPLOY
  -> APPROVAL_GATE_RELEASE
  -> PRODUCTION_DEPLOY
  -> OPERATIONS
```

Each phase emits events. A workflow resumes from persisted state rather than replaying an entire chat transcript.

## 5. Routing lanes

### Rapid

Use for standard websites, CRUD applications, dashboards, landing pages, and prototype validation where regulatory exposure and integration complexity are low.

Typical path:

```text
Discovery -> research -> rapid builder -> GitHub sync -> smoke tests -> preview
```

### Hybrid

Default for serious SaaS products. Generate UI rapidly, then move source into the canonical repository for backend implementation, data modeling, tests, and release controls.

```text
Discovery -> research -> architecture -> UI scaffold -> GitHub -> API/data implementation -> CI -> preview
```

### Enterprise

Use for sensitive data, regulated domains, complex integrations, custom infrastructure, strict observability, or multi-team development.

```text
Discovery -> research -> ADRs -> repository bootstrap -> isolated dev environment -> task PRs -> policy gates -> staged release
```

## 6. Context and execution flow

```text
User vision
   |
   v
OpenAI conversational intake
   |
   v
Orchestrator classifier
   |
   +--> Perplexity research --------+
   |                                |
   +--> xAI real-time pulse --------+--> Research normalizer
                                             |
                                             v
                           Canonical artifacts + citations
                                             |
                                             v
                                Context builder / retrieval
                                             |
                                +------------+------------+
                                |                         |
                                v                         v
                      Gemini long-context          Claude architecture
                      synthesis and summaries      and critical execution
                                |                         |
                                +------------+------------+
                                             |
                                             v
                                         Task DAG
                                             |
                          +------------------+------------------+
                          |                                     |
                          v                                     v
                 Rapid/Hybrid builder lane             Repository-first lane
                          |                                     |
                          +------------------+------------------+
                                             |
                                             v
                                    GitHub branches and PRs
                                             |
                                             v
                                    CI + validation workers
                                             |
                                             v
                                      Preview deployment
                                             |
                                             v
                                       Human approval
                                             |
                                             v
                                     Production deployment
```

Gemini is a context processor, not the database. Claude is an execution specialist, not the project manager. Research providers produce evidence-bearing artifacts; the orchestrator decides what becomes canonical state.

## 7. Shared-state write protocol

An agent reads an immutable context bundle and returns a proposal:

```json
{
  "proposal_id": "prop_01...",
  "project_id": "uuid",
  "base_version": 37,
  "context_bundle_id": "ctx_01...",
  "agent": "architecture.claude",
  "operations": [
    {
      "op": "replace",
      "path": "/architecture/services/2",
      "value": {}
    }
  ],
  "evidence": [],
  "tests_required": ["contract", "architecture-policy"]
}
```

Merge pipeline:

```text
schema validation
 -> authorization by path
 -> optimistic concurrency check
 -> semantic conflict check
 -> policy validation
 -> required tests
 -> merge
 -> increment version
 -> append audit event
 -> invalidate affected context bundles
```

## 8. Security boundaries

- Provider credentials are stored in a managed secret service, never in prompts or repository files.
- Per-project budgets and rate limits are enforced before provider calls.
- Tool permissions are scoped per task: research agents cannot deploy; UI agents cannot alter production data; deploy agents cannot change requirements.
- Code execution occurs in isolated, disposable environments with network and secret scopes appropriate to the task.
- Browser automation, when unavoidable, is isolated behind an adapter, feature flag, session vault, screenshots, and resumable checkpoints. It must never be the critical production path.
- Production deployment requires an explicit release gate and an immutable audit record.

## 9. Initial implementation sequence

1. Project intake and deterministic route decision.
2. Canonical project state, event log, and Master Project File materializer.
3. Provider-neutral model gateway and token ledger.
4. Research lane with evidence normalization.
5. Context builder and scoped context bundles.
6. Architecture lane and ADR generation.
7. GitHub task/branch/PR execution lane.
8. Builder adapters and GitHub handoff.
9. Validation pipeline and preview environments.
10. Production promotion, operations telemetry, and billing controls.

The first repository slice implements item 1 and establishes the contract required for item 2.
