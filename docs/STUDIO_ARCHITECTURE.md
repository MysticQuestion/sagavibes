# SagaVibes Studio Architecture

## Purpose

SagaVibes Studio is the client-facing visual development environment for SagaVibes. It is designed so that direct visual edits and agent-generated edits operate on the same canonical website representation rather than competing sources of truth.

The Studio does **not** treat generated React code as mutable project memory. Source code remains a delivery artifact. The editable website state is the Site Graph.

## Site Graph

The Site Graph is the website-specific state model inside the broader Master Project File. It contains:

- pages and routes
- ordered component instances
- component props/content
- visual state exposed to the editor
- design tokens
- version metadata

The first contract is defined in `contracts/site-graph.schema.json`.

The initial browser implementation lives in `apps/web/src/siteGraph.ts` and is intentionally dependency-free. A later visual-builder integration can render and mutate this same contract without changing the orchestration semantics.

## Shared editing model

Two interaction paths are supported:

### Direct manipulation

The client selects a component in the canvas and changes an inspector control. The editor converts the change into a Site Graph operation and applies it to the local working version.

### Agent proposal

The client selects a scope and sends a prompt. The Studio sends:

```json
{
  "prompt": "Make this hero more premium",
  "site_version": 7,
  "selection": {
    "page_id": "home",
    "node_id": "hero_01"
  }
}
```

The orchestrator returns a proposal containing an agent identity, intent, summary, base version, and structured operations. The user can inspect, apply, or discard the proposal.

This preserves the existing SagaVibes rule that agents propose changes rather than mutating shared canonical state directly.

## Patch operations

The foundation supports three operations:

- `set` — replace a value at a Site Graph path
- `append_node` — add a component to a page
- `remove_node` — remove a component from a page

The external proposal contract is defined in `contracts/site-patch.schema.json`.

Future operations can add movement/reordering, design-token transactions, page creation, CMS bindings, animation metadata, responsive overrides, and integration configuration.

## Current planner

`apps/api/studio.py` is a deterministic foundation planner. It recognizes a deliberately small set of commands and generates governed Site Graph operations. It does not call an LLM and does not fabricate copy or code for requests outside its supported command set.

Its purpose is to prove the agent/editor contract before provider execution is introduced.

## Agent integration sequence

The next implementation layer should replace the deterministic planner with a Saga Conductor that can delegate to specialists while preserving exactly the same response boundary.

Recommended initial specialist set:

1. Visual agent — layout, hierarchy, spacing, responsive presentation
2. Copy agent — headlines, body copy, CTA language, microcopy
3. Brand agent — design tokens, typography, palette, component preference rules
4. UX agent — information architecture, interaction behavior, conversion flow
5. SEO agent — metadata, headings, structured data, internal linking
6. Engineering agent — custom components that cannot be represented with the existing component registry
7. QA agent — schema, accessibility, visual regression, and release checks

The Conductor should remain responsible for the final proposal so that multiple specialists do not write conflicting mutations independently.

## Persistence model

The browser currently holds a demonstration Site Graph locally. Production persistence should introduce:

- `sites`
- `site_versions`
- `site_snapshots`
- `site_mutations`
- `design_systems`
- `agent_runs`
- `agent_actions`
- `approval_events`

Every accepted agent proposal should record the base version, resulting version, agent identity, operation list, requester, timestamp, and approval actor.

## Conflict control

Before a proposed mutation is merged into canonical state, the API should enforce:

1. schema validation
2. authorization by project and path
3. base-version / optimistic concurrency check
4. semantic conflict check
5. policy validation
6. required QA checks
7. audit append

A stale proposal should never silently overwrite a newer client edit.

## Component intelligence layer

The next component registry should describe more than React render functions. Each component should eventually carry metadata such as:

- allowed props
- editable fields
- semantic purpose
- compatible contexts
- responsive behavior
- accessibility requirements
- conversion role
- approved design-token usage
- agent permissions

This registry becomes the shared vocabulary used by the canvas, the inspector, and Saga agents.

## Visual editor integration

The present canvas is intentionally native React so the contract can stabilize first. Once the Site Graph and mutation protocol are validated, a dedicated embedded visual editor can replace the rendering shell while continuing to consume the same Site Graph.

The editor integration must not become the canonical state owner. SagaVibes remains the owner of project state and audit history.

## Release path

Studio changes should ultimately follow:

```text
Working Site Graph
  -> accepted patch
  -> versioned canonical state
  -> renderer/code generation
  -> tests
  -> preview deployment
  -> human release approval
  -> production deployment
```

This keeps prompt editing, visual editing, source control, QA, and deployment inside one governed lifecycle.
