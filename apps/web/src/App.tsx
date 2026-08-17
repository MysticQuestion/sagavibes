import { useState } from 'react';

import Intake from './Intake';
import Studio from './Studio';

type View = 'studio' | 'intake';

export default function App() {
  const [view, setView] = useState<View>('studio');

  return (
    <main className="page-shell">
      <header className="masthead app-masthead">
        <div>
          <p className="eyebrow">SAGA SOLUTIONS / CREATIVE OPERATING SYSTEM</p>
          <div className="brand-lockup">
            <h1>SagaVibes</h1>
            <span>Studio · foundation</span>
          </div>
          <p className="lede">
            A visual, agentic environment for turning a business vision into an editable digital
            product with governed changes from prompt to production.
          </p>
        </div>

        <nav className="product-nav" aria-label="SagaVibes workspace">
          <button
            type="button"
            className={view === 'studio' ? 'active' : ''}
            onClick={() => setView('studio')}
          >
            Studio
          </button>
          <button
            type="button"
            className={view === 'intake' ? 'active' : ''}
            onClick={() => setView('intake')}
          >
            Project routing
          </button>
        </nav>
      </header>

      {view === 'studio' ? <Studio /> : <Intake />}
    </main>
  );
}
