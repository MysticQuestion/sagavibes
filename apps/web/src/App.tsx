import { FormEvent, useState } from 'react';

type RouteDecision = {
  route: 'rapid' | 'hybrid' | 'enterprise';
  enterprise_score: number;
  reason_codes: string[];
  recommended_lane: string[];
  requires_human_approval: boolean;
};

type SignalKey =
  | 'speed_priority'
  | 'compliance'
  | 'integration_complexity'
  | 'custom_backend'
  | 'data_sensitivity'
  | 'scale_requirement'
  | 'expected_longevity';

type Signals = Record<SignalKey, number>;

const initialSignals: Signals = {
  speed_priority: 4,
  compliance: 1,
  integration_complexity: 3,
  custom_backend: 3,
  data_sensitivity: 1,
  scale_requirement: 3,
  expected_longevity: 4,
};

const labels: Record<SignalKey, string> = {
  speed_priority: 'Speed priority',
  compliance: 'Compliance pressure',
  integration_complexity: 'Integration complexity',
  custom_backend: 'Custom backend need',
  data_sensitivity: 'Data sensitivity',
  scale_requirement: 'Scale requirement',
  expected_longevity: 'Expected longevity',
};

const productionRoles = [
  ['Architecture', 'Defines system boundaries, data model, interfaces, and technical decisions.'],
  ['Design', 'Translates the brief into interaction, layout, component, and responsive states.'],
  ['Editorial', 'Maintains language, information hierarchy, source discipline, and content state.'],
  ['Accessibility', 'Reviews structure, keyboard behavior, semantics, contrast, and reduced-motion paths.'],
  ['Deployment', 'Prepares repository handoff, environment boundaries, preview state, and release checks.'],
];

const routeDescriptions: Record<RouteDecision['route'], string> = {
  rapid: 'UI-first prototype path with constrained integrations and a fast repository handoff.',
  hybrid: 'Interface work proceeds quickly, then moves into repository-based implementation, tests, and review.',
  enterprise: 'Repository-first architecture with stronger isolation, documentation, policy gates, and controlled deployment.',
};

function humanize(value: string) {
  return value.replaceAll('_', ' ').replaceAll('-', ' ');
}

export default function App() {
  const [idea, setIdea] = useState(
    'Build a public research interface with source provenance, an editorial evidence model, a maintained corrections ledger, and an operating dashboard.',
  );
  const [signals, setSignals] = useState<Signals>(initialSignals);
  const [prototypeOnly, setPrototypeOnly] = useState(false);
  const [decision, setDecision] = useState<RouteDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, prototype_only: prototypeOnly, ...signals }),
      });

      if (!response.ok) {
        throw new Error(`Routing request failed with status ${response.status}.`);
      }

      setDecision((await response.json()) as RouteDecision);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unknown routing error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="studio-page">
      <nav className="studio-nav" aria-label="Studio navigation">
        <a className="studio-brand" href="#top" aria-label="Saga Vibes Studio home">
          <strong>SAGA VIBES</strong>
          <span>STUDIO / SAGA SYSTEMS</span>
        </a>
        <div className="nav-state">
          <span><i /> ROUTING CORE LIVE</span>
          <a href="https://sagasystems.net" target="_blank" rel="noreferrer">Saga Systems ↗</a>
        </div>
      </nav>

      <main className="page-shell" id="top">
        <header className="studio-hero">
          <div className="hero-copy">
            <p className="eyebrow">SAGA VIBES STUDIO / FOUNDATION 0.2</p>
            <h1>Define the system before the agents touch it.</h1>
            <p className="lede">
              This prototype converts a project brief and explicit complexity signals into an inspectable
              delivery lane. It routes work; it does not pretend that one prompt has already designed,
              coded, tested, and deployed the product.
            </p>
          </div>

          <aside className="hero-ledger" aria-label="Current studio boundary">
            <div><span>STATE</span><strong>Routing foundation</strong></div>
            <div><span>INPUT</span><strong>Brief + scored constraints</strong></div>
            <div><span>OUTPUT</span><strong>Lane + reason codes</strong></div>
            <div><span>GATE</span><strong>Human architecture approval</strong></div>
          </aside>
        </header>

        <div className="stage-line" aria-label="Studio operating stages">
          {['Brief', 'Route', 'Architecture', 'Build', 'Verify', 'Deploy'].map((stage, index) => (
            <div className={index < 2 ? 'is-live' : 'is-reserved'} key={stage}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{stage}</strong>
              <small>{index < 2 ? 'foundation live' : 'reserved'}</small>
            </div>
          ))}
        </div>

        <section className="workspace-grid" aria-label="Routing workspace">
          <form className="panel intake-panel" onSubmit={submit}>
            <div className="section-heading">
              <span>01</span>
              <div>
                <p className="panel-kicker">PROJECT STATE</p>
                <h2>Brief + constraints</h2>
                <p>The same product idea can require a very different build path depending on what surrounds it.</p>
              </div>
            </div>

            <label className="field-label" htmlFor="idea">System brief</label>
            <textarea
              id="idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              aria-describedby="brief-note"
            />
            <p className="field-note" id="brief-note">Describe the intended system, users, operating environment, and material constraints. This layer does not call a generative model.</p>

            <div className="signals-heading">
              <span>ROUTING SIGNALS</span>
              <small>0 = low / 5 = high</small>
            </div>

            <div className="signal-grid">
              {Object.entries(labels).map(([key, label]) => {
                const signalKey = key as SignalKey;
                return (
                  <label className="signal-control" key={signalKey}>
                    <span>{label}</span>
                    <strong>{signals[signalKey]}</strong>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={signals[signalKey]}
                      onChange={(event) =>
                        setSignals((current) => ({
                          ...current,
                          [signalKey]: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                );
              })}
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={prototypeOnly}
                onChange={(event) => setPrototypeOnly(event.target.checked)}
              />
              <span><strong>Prototype-only</strong> — constrain the requested engagement to a prototype path where policy allows.</span>
            </label>

            <button className="route-button" type="submit" disabled={loading || idea.trim().length < 10}>
              {loading ? 'Evaluating route…' : 'Evaluate delivery lane'}
              <span aria-hidden="true">→</span>
            </button>
            {error && <p className="error-message" role="alert">{error}</p>}
          </form>

          <aside className="panel output-panel" aria-live="polite">
            <div className="section-heading">
              <span>02</span>
              <div>
                <p className="panel-kicker">POLICY OUTPUT</p>
                <h2>Routing decision</h2>
                <p>The decision is separable from future model output and carries explicit reasons.</p>
              </div>
            </div>

            {!decision ? (
              <div className="empty-state">
                <div className="empty-crosshair" aria-hidden="true"><i /><i /></div>
                <p>NO ROUTE EVALUATED</p>
                <span>Adjust the project state, then run the routing policy. The output will appear here without generating a site or codebase.</span>
              </div>
            ) : (
              <div className="decision-card">
                <div className="decision-topline">
                  <p className="route-kicker">RECOMMENDED LANE</p>
                  <span className={decision.requires_human_approval ? 'gate gate-required' : 'gate'}>
                    {decision.requires_human_approval ? 'human gate required' : 'policy gate clear'}
                  </span>
                </div>
                <h3>{decision.route}</h3>
                <p className="route-description">{routeDescriptions[decision.route]}</p>

                <div className="score-row">
                  <span>Enterprise pressure score</span>
                  <strong>{decision.enterprise_score}</strong>
                </div>

                <h4>Execution lane</h4>
                <ol className="lane-list">
                  {decision.recommended_lane.map((step, index) => (
                    <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{humanize(step)}</strong></li>
                  ))}
                </ol>

                <h4>Reason codes</h4>
                <div className="tag-list">
                  {decision.reason_codes.map((reason) => <span key={reason}>{humanize(reason)}</span>)}
                </div>

                <p className="approval-note">
                  A route is not permission to deploy. Architecture and production promotion remain human approval gates.
                </p>
              </div>
            )}
          </aside>
        </section>

        <section className="roles-section">
          <div className="section-intro">
            <p className="eyebrow">03 / PRODUCTION ROLES</p>
            <h2>Agents are responsibilities, not magic.</h2>
            <p>Future execution is organized into inspectable roles with bounded inputs and outputs. The routing foundation does not claim those agents are active in this interface yet.</p>
          </div>
          <div className="role-grid">
            {productionRoles.map(([role, detail], index) => (
              <article key={role}>
                <div><span>{String(index + 1).padStart(2, '0')}</span><small>MAPPED</small></div>
                <h3>{role}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="boundary-section">
          <div className="section-intro">
            <p className="eyebrow">04 / CURRENT BOUNDARY</p>
            <h2>Foundation first.</h2>
            <p>Saga Vibes is being built around canonical project state, provider-agnostic orchestration, explicit budget and policy controls, and structured agent handoffs. The public interface should expand only when those layers exist.</p>
          </div>
          <div className="boundary-grid">
            <div>
              <small>AVAILABLE IN THIS FOUNDATION</small>
              <ul>
                <li>Project intake</li>
                <li>Seven scored routing signals</li>
                <li>Rapid / hybrid / enterprise policy lanes</li>
                <li>Reason codes and execution lane</li>
                <li>Human approval requirement</li>
                <li>Master Project File contract in repository</li>
              </ul>
            </div>
            <div>
              <small>NOT CLAIMED AS LIVE HERE</small>
              <ul>
                <li>Autonomous code generation</li>
                <li>Visual drag-and-drop editor</li>
                <li>Multi-agent execution</li>
                <li>Persistent client workspace</li>
                <li>Automated production deployment</li>
                <li>Unreviewed model decisions</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="studio-footer">
        <div><strong>Saga Vibes Studio</strong><span>Part of Saga Systems</span></div>
        <div><span>FOUNDATION 0.2</span><span>ROUTING BEFORE GENERATION</span></div>
      </footer>
    </div>
  );
}
