export type Viewport = 'desktop' | 'tablet' | 'mobile';

export type SiteNodeType = 'hero' | 'metrics' | 'services' | 'cta';
export type SurfaceTone = 'base' | 'muted' | 'accent';
export type TextAlign = 'left' | 'center';
export type Emphasis = 'standard' | 'strong';
export type Density = 'compact' | 'comfortable' | 'spacious';

export type SiteNode = {
  id: string;
  type: SiteNodeType;
  label: string;
  props: Record<string, string>;
  style: {
    tone: SurfaceTone;
    align: TextAlign;
    emphasis: Emphasis;
    density: Density;
  };
};

export type SitePage = {
  id: string;
  name: string;
  slug: string;
  node_ids: string[];
};

export type SiteGraph = {
  site_id: string;
  project_id: string;
  version: number;
  name: string;
  active_page_id: string;
  design_tokens: {
    colors: {
      background: string;
      surface: string;
      text: string;
      muted: string;
      accent: string;
    };
    typography: {
      display: string;
      body: string;
    };
    radius: string;
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  pages: SitePage[];
  nodes: Record<string, SiteNode>;
};

export type StudioOperation =
  | {
      op: 'set';
      path: string;
      value: unknown;
    }
  | {
      op: 'append_node';
      page_id: string;
      node: SiteNode;
    }
  | {
      op: 'remove_node';
      page_id: string;
      node_id: string;
    };

export const initialSiteGraph: SiteGraph = {
  site_id: 'site_demo_saga_vibes',
  project_id: 'project_demo_saga_vibes',
  version: 1,
  name: 'Saga Vibes Studio Demo',
  active_page_id: 'home',
  design_tokens: {
    colors: {
      background: '#09090a',
      surface: '#141416',
      text: '#f4f0e7',
      muted: '#9f9992',
      accent: '#c7ae69',
    },
    typography: {
      display: 'Georgia, serif',
      body: 'Inter, ui-sans-serif, system-ui, sans-serif',
    },
    radius: '18px',
    spacing: {
      xs: '8px',
      sm: '12px',
      md: '20px',
      lg: '32px',
      xl: '56px',
    },
  },
  pages: [
    {
      id: 'home',
      name: 'Home',
      slug: '/',
      node_ids: ['hero_01', 'metrics_01', 'services_01', 'cta_01'],
    },
  ],
  nodes: {
    hero_01: {
      id: 'hero_01',
      type: 'hero',
      label: 'Hero',
      props: {
        eyebrow: 'SAGA VIBES / DIGITAL STUDIO',
        heading: 'Build the site by describing what you want.',
        body:
          'Prompt the studio, edit the result visually, and route deeper work to specialist Saga agents without leaving the canvas.',
        primaryCta: 'Start a project',
        secondaryCta: 'Explore the system',
      },
      style: {
        tone: 'base',
        align: 'left',
        emphasis: 'strong',
        density: 'spacious',
      },
    },
    metrics_01: {
      id: 'metrics_01',
      type: 'metrics',
      label: 'Proof strip',
      props: {
        metric1Value: '01',
        metric1Label: 'Canonical site graph',
        metric2Value: '08',
        metric2Label: 'Specialist agent lanes',
        metric3Value: '100%',
        metric3Label: 'Inspectable changes',
      },
      style: {
        tone: 'muted',
        align: 'left',
        emphasis: 'standard',
        density: 'compact',
      },
    },
    services_01: {
      id: 'services_01',
      type: 'services',
      label: 'Capabilities',
      props: {
        eyebrow: 'BUILT INTO THE WORKSPACE',
        heading: 'One canvas. Multiple specialist systems.',
        body:
          'Brand, copy, UX, SEO, engineering, data, security, QA, and deployment can all operate through the same structured project state.',
        service1: 'Brand intelligence',
        service2: 'Visual direction',
        service3: 'Conversion copy',
        service4: 'Technical delivery',
      },
      style: {
        tone: 'base',
        align: 'left',
        emphasis: 'standard',
        density: 'comfortable',
      },
    },
    cta_01: {
      id: 'cta_01',
      type: 'cta',
      label: 'Closing CTA',
      props: {
        eyebrow: 'READY FOR THE NEXT COMMAND',
        heading: 'Select anything. Tell Saga what should change.',
        body:
          'Every accepted change becomes a structured mutation with a version number, agent attribution, and a path back.',
        primaryCta: 'Ask Saga',
      },
      style: {
        tone: 'accent',
        align: 'center',
        emphasis: 'strong',
        density: 'spacious',
      },
    },
  },
};

function setAtPath(target: SiteGraph, path: string, value: unknown): SiteGraph {
  if (!path.startsWith('/')) {
    return target;
  }

  const segments = path
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replaceAll('~1', '/').replaceAll('~0', '~'));

  if (segments.length === 0) {
    return target;
  }

  const clone = structuredClone(target);
  let cursor: Record<string, unknown> = clone as unknown as Record<string, unknown>;

  for (const segment of segments.slice(0, -1)) {
    const next = cursor[segment];
    if (typeof next !== 'object' || next === null || Array.isArray(next)) {
      return target;
    }
    cursor = next as Record<string, unknown>;
  }

  cursor[segments[segments.length - 1]] = value;
  return clone;
}

export function applyStudioOperations(
  graph: SiteGraph,
  operations: StudioOperation[],
): SiteGraph {
  let next = graph;

  for (const operation of operations) {
    if (operation.op === 'set') {
      next = setAtPath(next, operation.path, operation.value);
      continue;
    }

    const clone = structuredClone(next);
    const page = clone.pages.find((candidate) => candidate.id === operation.page_id);

    if (!page) {
      continue;
    }

    if (operation.op === 'append_node') {
      clone.nodes[operation.node.id] = operation.node;
      if (!page.node_ids.includes(operation.node.id)) {
        page.node_ids.push(operation.node.id);
      }
      next = clone;
      continue;
    }

    delete clone.nodes[operation.node_id];
    page.node_ids = page.node_ids.filter((nodeId) => nodeId !== operation.node_id);
    next = clone;
  }

  if (next === graph) {
    return graph;
  }

  return {
    ...next,
    version: graph.version + 1,
  };
}
