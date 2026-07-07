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

export default function App() {
  const [idea, setIdea] = useState(
    'I want to build a premium real estate platform for curated luxury listings, geo search, saved properties, broker workflows, and concierge appointments.',
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
    <main className="page-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">SAGA SOLUTIONS / SOFTWARE FACTORY</p>
          <h1>SagaVibes</h1>
          <p className="lede">
            Turn a business vision into a governed software delivery plan—research, architecture,
            code generation, validation, and deployment.
          </p>
        </div>
        <div className="status-chip">Foundation · v0.1</div>
      </header>

      <section className="workspace-grid">
        <form className="panel" onSubmit={submit}>
          <div className="section-heading">
            <span>01</span>
            <div>
              <h2>Project intake</h2>
              <p>Describe the product. The orchestrator evaluates the build lane before agents execute.</p>
            </div>
          </div>

          <label className="field-label" htmlFor="idea">
            What are we building?
          </label>
          <textarea id="idea" value={idea} onChange={(event) => setIdea(event.target.value)} />

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
            <span>Prototype-only engagement</span>
          </label>

          <button type="submit" disabled={loading || idea.trim().length < 10}>
            {loading ? 'Evaluating route…' : 'Route this project'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>

        <aside className="panel output-panel">
          <div className="section-heading">
            <span>02</span>
            <div>
              <h2>Delivery lane</h2>
              <p>The policy result is explicit, inspectable, and separable from model output.</p>
            </div>
          </div>

          {!decision ? (
            <div className="empty-state">
              <p>NO ROUTE SELECTED</p>
              <span>Submit a project vision to generate the first orchestration decision.</span>
            </div>
          ) : (
            <div className="decision-card">
              <p className="route-kicker">RECOMMENDED ROUTE</p>
              <h3>{decision.route}</h3>
              <div className="score-row">
                <span>Enterprise score</span>
                <strong>{decision.enterprise_score}</strong>
              </div>

              <h4>Execution lane</h4>
              <ol>
                {decision.recommended_lane.map((step) => (
                  <li key={step}>{step.replaceAll('-', ' ')}</li>
                ))}
              </ol>

              <h4>Reason codes</h4>
              <div className="tag-list">
                {decision.reason_codes.map((reason) => (
                  <span key={reason}>{reason.replaceAll('_', ' ')}</span>
                ))}
              </div>

              <p className="approval-note">
                Architecture and production promotion remain human approval gates.
              </p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
