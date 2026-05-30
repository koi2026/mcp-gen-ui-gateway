# Pretotype Architecture

## Core

The pretotype uses a real stdio MCP server and a deliberately fake brain.

```text
fixed staged prompt with one exact tag
  -> compose_genui_artifact({ utterance })
  -> MCP loads scenarios/scenario_*.json
  -> MCP extracts the exact tag and finds the manifest
  -> MCP reads the manifest's checked-in HTML file
  -> host renders returned HTML verbatim
```

## Contexts

```text
[신혼부부]     -> newlywed   -> embedded/newlywed.html
[프리랜서]     -> freelancer -> embedded/freelancer.html
[박사후연구원] -> postdoc     -> embedded/postdoc.html
```

Each route also has a human-readable manifest under `apps/demo-ui/public/pretotype/scenarios/`. The manifest is not a live ranking result; it is the staged routing card for reviewers. Each embedded file is self-contained: CSS, JS, and images are already inside the HTML.

## Manifest Shape

```ts
type PretotypeScenario = {
  id: "newlywed" | "freelancer" | "postdoc";
  tag: "[신혼부부]" | "[프리랜서]" | "[박사후연구원]";
  label: string;
  stagedPrompt: string;
  routePolicy: "exact-tag-only";
  artifact: {
    mode: "self-contained-html";
    html: string;
  };
  assets: {
    id: string;
    kind: "image" | "font" | "script" | "style";
    delivery: "inline-data-url" | "inline-source" | "system-font-stack";
    format: string;
    count: number;
    note: string;
  }[];
  surface: {
    headline: string;
    signature: string;
    modules: string[];
  };
  officialHandoffs: {
    label: string;
    domain: string;
    purpose: string;
  }[];
  boundaries: string[];
};
```

## Contract

```ts
type ComposeGenuiArtifactInput = {
  utterance: string;
};
```

The MCP response is text content containing full HTML:

```ts
{ content: [{ type: "text", text: "<!DOCTYPE html>..." }] }
```

Missing, unsupported, or ambiguous tags return a disclosure string instead of selecting or fabricating another scenario. This is pretotype-scoped: the prompt text is staged, and the tag is the route.

## Boundaries

- No live API fetch.
- No login, identity, authentication, or submission.
- External links are official handoff links only.
- No sibling asset fetch for the artifact: image, CSS, and runtime JS dependencies stay inline.
- Future production work can replace the hardcoded lookup with taxonomy/ranker logic without changing the demo contract.
