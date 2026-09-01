# Saga Vibes Studio

**Saga Vibes Studio** is the prompt-driven production environment inside **Saga Systems**. Its purpose is to turn a project brief into explicit project state, route that state through a governed delivery policy, and eventually coordinate bounded production roles across architecture, design, editorial, accessibility, implementation, verification, and deployment.

The current foundation does **not** claim autonomous end-to-end generation. V1 focuses on the layers that need to exist before generation becomes trustworthy: canonical project state, provider-agnostic orchestration, explicit routing policy, structured contracts, budget and risk controls, and human approval gates.

## Core principle

AI tools do not share mutable memory directly. Saga Vibes maintains a canonical project state and gives each production role a scoped context bundle. Future agents return structured patch proposals, artifacts, code changes, and evidence; the orchestrator validates and merges those outputs instead of treating model output as automatically authoritative.

## Current foundation

The repository currently contains:

- a project-intake interface;
- seven scored routing signals;
- a routing API that selects a rapid, hybrid, or enterprise lane;
- explicit reason codes and recommended execution steps;
- human-approval state;
- a Master Project File JSON Schema;
- software architecture and integration-strategy documentation.

## SagaVibes Studio

Studio is the client-facing visual development environment. Website projects are represented as a canonical **Site Graph** inside the broader Master Project File so that direct visual edits and agent-generated edits operate on the same state model.

The foundation Studio includes:

- selectable visual canvas
- component and page navigation
- desktop, tablet, and mobile previews
- inspector-based content and appearance editing
- local undo history
- scoped natural-language commands
- inspectable Site Graph patch proposals with explicit apply/discard approval
- a preserved project-routing workspace

The first command planner is deterministic by design. It proves the editor/agent contract without pretending that model-backed specialists are already connected. See `docs/STUDIO_ARCHITECTURE.md`.

## Planned lanes

- **Rapid lane** — UI-first scaffolding and prototypes through supported builder integrations and repository handoff.
- **Hybrid lane** — rapid interface generation followed by repository-based backend implementation, tests, security review, and preview deployment.
- **Enterprise lane** — repository-first architecture, isolated execution environments, explicit architecture decisions, CI policy gates, and controlled deployment.

## Repository layout

```text
apps/
  api/        FastAPI orchestration API and routing policy
  web/        Vite + React Saga Vibes Studio interface
contracts/    JSON Schemas and inter-role contracts
docs/         Architecture and integration strategy
```

## Local development

### API

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Web

```bash
cd apps/web
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8000`.

## Security

Never commit provider API keys. Use environment variables locally and a managed secret store in deployed environments. Provider-specific credentials must be scoped, revocable, and separated by environment.

## Brand

Saga Vibes Studio is a Saga Systems product environment. Public interfaces should use the Saga Systems institutional identity without exposing personal coordinator information or legacy Saga Solutions language.
