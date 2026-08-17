import { useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';

import {
  applyStudioOperations,
  initialSiteGraph,
  type SiteGraph,
  type SiteNode,
  type StudioOperation,
  type Viewport,
} from './siteGraph';

type StudioPlan = {
  agent: 'conductor' | 'brand' | 'visual' | 'copy' | 'ux' | 'seo';
  intent: string;
  summary: string;
  operations: StudioOperation[];
  requires_human_approval: boolean;
};

const agents = [
  ['Conductor', 'Routes the command'],
  ['Brand', 'Tokens + identity'],
  ['Visual', 'Layout + hierarchy'],
  ['Copy', 'Messaging + microcopy'],
  ['UX', 'Flows + responsive behavior'],
  ['SEO', 'Metadata + structure'],
  ['Engineering', 'Custom components'],
  ['QA', 'Validation + release gates'],
] as const;

const viewportLabels: Record<Viewport, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
};

function humanizeKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(\D)(\d)/g, '$1 $2')
    .replace(/^./, (character) => character.toUpperCase());
}

function nodeClassName(node: SiteNode, selected: boolean) {
  return [
    'preview-section',
    `preview-${node.type}`,
    `tone-${node.style.tone}`,
    `align-${node.style.align}`,
    `emphasis-${node.style.emphasis}`,
    `density-${node.style.density}`,
    selected ? 'is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function PreviewNode({
  node,
  selected,
  onSelect,
}: {
  node: SiteNode;
  selected: boolean;
  onSelect: () => void;
}) {
  const props = node.props;

  if (node.type === 'hero') {
    return (
      <section className={nodeClassName(node, selected)} onClick={onSelect}>
        <span className="selection-badge">{node.label}</span>
        <p className="preview-eyebrow">{props.eyebrow}</p>
        <h2>{props.heading}</h2>
        <p className="preview-copy">{props.body}</p>
        <div className="preview-actions">
          <button type="button">{props.primaryCta}</button>
          <button type="button" className="ghost-button">
            {props.secondaryCta}
          </button>
        </div>
      </section>
    );
  }

  if (node.type === 'metrics') {
    return (
      <section className={nodeClassName(node, selected)} onClick={onSelect}>
        <span className="selection-badge">{node.label}</span>
        <div className="metric-grid">
          {[1, 2, 3].map((index) => (
            <div key={index}>
              <strong>{props[`metric${index}Value`]}</strong>
              <span>{props[`metric${index}Label`]}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (node.type === 'services') {
    return (
      <section className={nodeClassName(node, selected)} onClick={onSelect}>
        <span className="selection-badge">{node.label}</span>
        <p className="preview-eyebrow">{props.eyebrow}</p>
        <h3>{props.heading}</h3>
        <p className="preview-copy">{props.body}</p>
        <div className="service-grid">
          {[1, 2, 3, 4].map((index) => (
            <article key={index}>
              <span>0{index}</span>
              <strong>{props[`service${index}`]}</strong>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={nodeClassName(node, selected)} onClick={onSelect}>
      <span className="selection-badge">{node.label}</span>
      <p className="preview-eyebrow">{props.eyebrow}</p>
      <h3>{props.heading}</h3>
      <p className="preview-copy">{props.body}</p>
      <div className="preview-actions">
        <button type="button">{props.primaryCta}</button>
      </div>
    </section>
  );
}

export default function Studio() {
  const [graph, setGraph] = useState<SiteGraph>(initialSiteGraph);
  const [selectedNodeId, setSelectedNodeId] = useState('hero_01');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [prompt, setPrompt] = useState('Make this hero feel more premium and emphasize the CTA.');
  const [plan, setPlan] = useState<StudioPlan | null>(null);
  const [history, setHistory] = useState<SiteGraph[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePage = useMemo(
    () => graph.pages.find((page) => page.id === graph.active_page_id) ?? graph.pages[0],
    [graph],
  );
  const selectedNode = graph.nodes[selectedNodeId] ?? graph.nodes[activePage.node_ids[0]];

  const previewStyle = {
    '--preview-bg': graph.design_tokens.colors.background,
    '--preview-surface': graph.design_tokens.colors.surface,
    '--preview-text': graph.design_tokens.colors.text,
    '--preview-muted': graph.design_tokens.colors.muted,
    '--preview-accent': graph.design_tokens.colors.accent,
    '--preview-radius': graph.design_tokens.radius,
    '--preview-display': graph.design_tokens.typography.display,
    '--preview-body': graph.design_tokens.typography.body,
  } as CSSProperties;

  function commitOperations(operations: StudioOperation[]) {
    if (operations.length === 0) {
      return;
    }
    setHistory((current) => [...current.slice(-19), graph]);
    setGraph((current) => applyStudioOperations(current, operations));
  }

  function updateSelectedProp(key: string, value: string) {
    commitOperations([
      {
        op: 'set',
        path: `/nodes/${selectedNode.id}/props/${key}`,
        value,
      },
    ]);
  }

  function updateSelectedStyle(
    key: 'tone' | 'align' | 'emphasis' | 'density',
    value: string,
  ) {
    commitOperations([
      {
        op: 'set',
        path: `/nodes/${selectedNode.id}/style/${key}`,
        value,
      },
    ]);
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) {
      return;
    }
    setGraph(previous);
    setHistory((current) => current.slice(0, -1));
    setPlan(null);
  }

  async function proposeCommand(event: FormEvent) {
    event.preventDefault();
    if (prompt.trim().length < 2) {
      return;
    }

    setBusy(true);
    setError(null);
    setPlan(null);

    try {
      const response = await fetch('/api/studio/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          site_version: graph.version,
          selection: {
            page_id: activePage.id,
            node_id: selectedNode.id,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Studio planner returned ${response.status}.`);
      }

      setPlan((await response.json()) as StudioPlan);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Studio planner failed.');
    } finally {
      setBusy(false);
    }
  }

  function applyPlan() {
    if (!plan) {
      return;
    }
    commitOperations(plan.operations);
    setPlan(null);
  }

  return (
    <section className="studio-shell">
      <div className="studio-toolbar">
        <div>
          <p className="studio-kicker">LIVE PROJECT</p>
          <strong>{graph.name}</strong>
          <span>v{graph.version}</span>
        </div>

        <div className="viewport-switcher" aria-label="Preview viewport">
          {(Object.keys(viewportLabels) as Viewport[]).map((candidate) => (
            <button
              type="button"
              className={viewport === candidate ? 'active' : ''}
              key={candidate}
              onClick={() => setViewport(candidate)}
            >
              {viewportLabels[candidate]}
            </button>
          ))}
        </div>

        <div className="studio-toolbar-actions">
          <button type="button" className="secondary-action" onClick={undo} disabled={history.length === 0}>
            Undo
          </button>
          <button type="button" disabled>
            Preview deploy
          </button>
        </div>
      </div>

      <div className="studio-grid">
        <aside className="studio-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-heading">
              <span>Pages</span>
              <button type="button" aria-label="Add page">
                +
              </button>
            </div>
            {graph.pages.map((page) => (
              <button
                type="button"
                className={`page-row ${page.id === graph.active_page_id ? 'active' : ''}`}
                key={page.id}
              >
                <span>{page.name}</span>
                <small>{page.slug}</small>
              </button>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-heading">
              <span>Components</span>
              <small>{activePage.node_ids.length}</small>
            </div>
            <div className="component-list">
              {activePage.node_ids.map((nodeId, index) => {
                const node = graph.nodes[nodeId];
                if (!node) {
                  return null;
                }
                return (
                  <button
                    type="button"
                    key={node.id}
                    className={node.id === selectedNode.id ? 'active' : ''}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    <span>0{index + 1}</span>
                    <strong>{node.label}</strong>
                    <small>{node.type}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sidebar-section agent-section">
            <div className="sidebar-heading">
              <span>Saga agents</span>
              <small>8 ready</small>
            </div>
            {agents.map(([name, role]) => (
              <div className="agent-row" key={name}>
                <span className="agent-status" />
                <div>
                  <strong>{name}</strong>
                  <small>{role}</small>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="studio-stage">
          <div className={`preview-frame viewport-${viewport}`}>
            <div className="site-preview" style={previewStyle}>
              {activePage.node_ids.map((nodeId) => {
                const node = graph.nodes[nodeId];
                if (!node) {
                  return null;
                }

                return (
                  <PreviewNode
                    node={node}
                    selected={node.id === selectedNode.id}
                    onSelect={() => setSelectedNodeId(node.id)}
                    key={node.id}
                  />
                );
              })}
            </div>
          </div>

          <div className="command-dock">
            {plan && (
              <div className="plan-card">
                <div>
                  <p>{plan.agent.toUpperCase()} AGENT · {plan.intent}</p>
                  <strong>{plan.summary}</strong>
                  <span>{plan.operations.length} structured change{plan.operations.length === 1 ? '' : 's'} proposed</span>
                </div>
                <div className="plan-actions">
                  <button type="button" className="secondary-action" onClick={() => setPlan(null)}>
                    Discard
                  </button>
                  <button type="button" onClick={applyPlan} disabled={plan.operations.length === 0}>
                    Apply changes
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={proposeCommand}>
              <div className="command-icon">✦</div>
              <textarea
                aria-label="Ask Saga"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder='Try: “center this”, “make this more premium”, or “set heading to Build what comes next”'
              />
              <button type="submit" disabled={busy || prompt.trim().length < 2}>
                {busy ? 'Planning…' : 'Ask Saga'}
              </button>
            </form>
            {error && <p className="command-error">{error}</p>}
          </div>
        </div>

        <aside className="studio-inspector">
          <div className="inspector-header">
            <p>INSPECTOR</p>
            <h3>{selectedNode.label}</h3>
            <span>{selectedNode.id}</span>
          </div>

          <div className="inspector-section">
            <h4>Content</h4>
            {Object.entries(selectedNode.props).map(([key, value]) => (
              <label className="inspector-field" key={key}>
                <span>{humanizeKey(key)}</span>
                {value.length > 70 || key.toLowerCase().includes('body') ? (
                  <textarea
                    value={value}
                    onChange={(event) => updateSelectedProp(key, event.target.value)}
                  />
                ) : (
                  <input
                    value={value}
                    onChange={(event) => updateSelectedProp(key, event.target.value)}
                  />
                )}
              </label>
            ))}
          </div>

          <div className="inspector-section">
            <h4>Appearance</h4>
            <label className="inspector-field">
              <span>Surface</span>
              <select
                value={selectedNode.style.tone}
                onChange={(event) => updateSelectedStyle('tone', event.target.value)}
              >
                <option value="base">Base</option>
                <option value="muted">Muted</option>
                <option value="accent">Accent</option>
              </select>
            </label>
            <label className="inspector-field">
              <span>Alignment</span>
              <select
                value={selectedNode.style.align}
                onChange={(event) => updateSelectedStyle('align', event.target.value)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
              </select>
            </label>
            <label className="inspector-field">
              <span>Emphasis</span>
              <select
                value={selectedNode.style.emphasis}
                onChange={(event) => updateSelectedStyle('emphasis', event.target.value)}
              >
                <option value="standard">Standard</option>
                <option value="strong">Strong</option>
              </select>
            </label>
            <label className="inspector-field">
              <span>Density</span>
              <select
                value={selectedNode.style.density}
                onChange={(event) => updateSelectedStyle('density', event.target.value)}
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="spacious">Spacious</option>
              </select>
            </label>
          </div>

          <div className="inspector-section mutation-note">
            <h4>Structured state</h4>
            <p>
              Visual edits and agent proposals both resolve into Site Graph operations instead of opaque code rewrites.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
