# SagaVibes

**SagaVibes** is an AI software factory and meta-orchestration platform for turning a business vision into a researched, architected, tested, and deployable software product.

The platform is designed around a provider-agnostic orchestration core, a canonical project state, durable workflow execution, explicit budget controls, and human approval gates.

## Core principle

AI tools do not share mutable memory directly. SagaVibes maintains a canonical project state and gives each agent a scoped context bundle. Agents return structured patch proposals, artifacts, code changes, and evidence; the orchestrator validates and merges those outputs.

## Planned lanes

- **Rapid lane** — UI-first scaffolding and prototypes through supported builder integrations and GitHub handoff.
- **Hybrid lane** — rapid UI generation followed by repository-based backend implementation, tests, security review, and preview deployment.
- **Enterprise lane** — repository-first architecture, isolated execution environments, explicit ADRs, CI policy gates, and controlled deployment.

## Initial repository layout

```text
apps/
  api/        FastAPI orchestration API
  web/        Vite + React control plane
contracts/    JSON Schemas and inter-agent contracts
docs/         Architecture and operating model
```

## Local development

The foundation branch introduces the first routing API, the web intake screen, the Master Project File contract, and the Software Architecture Document.

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
