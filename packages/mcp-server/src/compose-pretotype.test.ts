import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { composeGenuiArtifactText, loadPretotypeScenarios } from "./compose-pretotype.js";

describe("composeGenuiArtifactText", () => {
  const previousDist = process.env.MCP_GEN_UI_PRETOTYPE_DIST;
  let dist: string;
  const taggedUtterances = {
    newlywed: "[신혼부부] 대전 유성구로 이사 왔어요.",
    freelancer: "[프리랜서] 대전 유성구로 이사 왔어요.",
    postdoc: "[박사후연구원] 대전 유성구로 이사 왔어요."
  };

  beforeEach(async () => {
    dist = await mkdtemp(join(tmpdir(), "mcp-gen-ui-pretotype-"));
    process.env.MCP_GEN_UI_PRETOTYPE_DIST = dist;
    await mkdir(join(dist, "embedded"), { recursive: true });
    await mkdir(join(dist, "scenarios"), { recursive: true });
    await writeFile(join(dist, "embedded", "newlywed.html"), renderEmbeddedFixture("newlywed", ["gov.kr", "law.go.kr", "data.go.kr"]));
    await writeFile(join(dist, "embedded", "freelancer.html"), renderEmbeddedFixture("freelancer", ["hometax.go.kr", "gov.kr", "law.go.kr", "data.go.kr"]));
    await writeFile(join(dist, "embedded", "postdoc.html"), renderEmbeddedFixture("postdoc", ["gov.kr", "data.go.kr", "ntis.go.kr", "innopolis.or.kr", "hometax.go.kr", "law.go.kr"]));
    await writeFile(join(dist, "scenarios", "scenario_newlywed.json"), renderScenarioFixture("newlywed", "[신혼부부]", "embedded/newlywed.html"));
    await writeFile(join(dist, "scenarios", "scenario_freelancer.json"), renderScenarioFixture("freelancer", "[프리랜서]", "embedded/freelancer.html"));
    await writeFile(join(dist, "scenarios", "scenario_postdoc.json"), renderScenarioFixture("postdoc", "[박사후연구원]", "embedded/postdoc.html"));
  });

  afterEach(async () => {
    if (previousDist === undefined) {
      delete process.env.MCP_GEN_UI_PRETOTYPE_DIST;
    } else {
      process.env.MCP_GEN_UI_PRETOTYPE_DIST = previousDist;
    }

    await rm(dist, { force: true, recursive: true });
  });

  it("returns checked-in self-contained HTML for all supported contexts", async () => {
    const expectedDomains = {
      newlywed: ["gov.kr", "law.go.kr", "data.go.kr"],
      freelancer: ["hometax.go.kr", "gov.kr", "law.go.kr", "data.go.kr"],
      postdoc: ["gov.kr", "data.go.kr", "ntis.go.kr", "innopolis.or.kr", "hometax.go.kr", "law.go.kr"]
    };

    for (const [context, domains] of Object.entries(expectedDomains)) {
      const html = await composeGenuiArtifactText({ utterance: taggedUtterances[context as keyof typeof taggedUtterances] });

      expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
      expect(html).toContain('target="_blank" rel="noopener noreferrer"');
      expect(html).toContain("Tool trace");
      expect(html).toContain('src="data:image/jpeg;base64,/9j/2Q=="');
      expect(html).not.toContain('href="shared.css"');
      expect(html).not.toContain('src="assets/');
      expect(html).not.toContain('src="toggle.js"');

      for (const domain of domains) {
        expect(html).toContain(domain);
      }
    }
  });

  it("loads human-readable scenario metadata as the routing table", async () => {
    const scenarios = await loadPretotypeScenarios();

    expect(scenarios).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "newlywed",
          tag: "[신혼부부]",
          routePolicy: "exact-tag-only",
          artifact: { mode: "self-contained-html", html: "embedded/newlywed.html" },
          assets: expect.arrayContaining([expect.objectContaining({ delivery: "inline-data-url", kind: "image" })])
        }),
        expect.objectContaining({
          id: "freelancer",
          tag: "[프리랜서]",
          routePolicy: "exact-tag-only",
          artifact: { mode: "self-contained-html", html: "embedded/freelancer.html" },
          assets: expect.arrayContaining([expect.objectContaining({ delivery: "inline-data-url", kind: "image" })])
        }),
        expect.objectContaining({
          id: "postdoc",
          tag: "[박사후연구원]",
          routePolicy: "exact-tag-only",
          artifact: { mode: "self-contained-html", html: "embedded/postdoc.html" },
          assets: expect.arrayContaining([expect.objectContaining({ delivery: "inline-data-url", kind: "image" })])
        })
      ])
    );
  });

  it("keeps checked-in artifact dependencies inline so Claude does not need sibling assets", async () => {
    for (const context of Object.keys(taggedUtterances)) {
      const html = await readFile(new URL(`../../../apps/demo-ui/public/pretotype/embedded/${context}.html`, import.meta.url), "utf8");

      expect(html.match(/<img\b[^>]*\ssrc=["']data:image\//g)).toHaveLength(4);
      expect(html).toContain('--gov24-logo-image: url("data:image/webp;base64,');
      expect(html).toContain("brand-logo");
      expect(html).toContain("footer-brand-logo");
      expect(html).not.toMatch(/<link\b/i);
      expect(html).not.toMatch(/<script\b[^>]*\ssrc=/i);
      expect(html).not.toMatch(/@import\s+url/i);
      expect(html).not.toMatch(/url\((?!['"]?data:)/i);
      expect(html).not.toMatch(/<img\b[^>]*\ssrc=(['"])(?!data:image\/)/i);
    }
  });

  it("keeps checked-in pretotype links actionable and documents URL handoffs", async () => {
    const htmlByContext: Record<string, string> = {};
    const broadHomepageHref =
      /href=["']https:\/\/(?:www\.)?(?:gov\.kr|hometax\.go\.kr|bokjiro\.go\.kr|iros\.go\.kr|epost\.go\.kr|nhis\.or\.kr|nrf\.re\.kr|ntis\.go\.kr|myhome\.go\.kr|info\.childcare\.go\.kr)\/?["']/;

    for (const context of Object.keys(taggedUtterances)) {
      const html = await readFile(new URL(`../../../apps/demo-ui/public/pretotype/embedded/${context}.html`, import.meta.url), "utf8");
      const scenario = JSON.parse(
        await readFile(new URL(`../../../apps/demo-ui/public/pretotype/scenarios/scenario_${context}.json`, import.meta.url), "utf8")
      ) as { officialHandoffs?: { url?: unknown }[] };

      htmlByContext[context] = html;

      expect(html).not.toMatch(/\shref=["']#["']/);
      expect(html).not.toMatch(broadHomepageHref);
      expect(scenario.officialHandoffs?.every((handoff) => typeof handoff.url === "string" && handoff.url.startsWith("https://"))).toBe(true);
    }

    expect(htmlByContext.newlywed).toContain("selectSelfDiagnosisView.do");
    expect(htmlByContext.newlywed).toContain("alaWaitList.do");
    expect(htmlByContext.newlywed).toContain("14일 내 신청·다음날 0시 효력");
    expect(htmlByContext.freelancer).toContain("menuNo=200201");
    expect(htmlByContext.freelancer).toContain("deliveryChangeInfoReg.do");
    expect(htmlByContext.freelancer).toContain("gpsUserView.do");
    expect(htmlByContext.freelancer).toContain("14일 내 신청·다음날 0시 효력");
    expect(htmlByContext.postdoc).toContain("www.zeus.go.kr");
    expect(htmlByContext.postdoc).toContain("minwon.nhis.or.kr");
    expect(htmlByContext.postdoc).toContain("menuNo=200040");
    expect(htmlByContext.postdoc).toContain("CappBizCD=13100000042");
  });

  it("renders distinct GenUI surface architecture per context", async () => {
    const expectedModules = {
      newlywed: [
        "risk-score-panel",
        "action-bundle",
        "legal-checklist",
        "rent-evidence",
        "housing-candidate-rail",
        "family-life-map"
      ],
      freelancer: [
        "deadline-timeline",
        "tax-action-panel",
        "business-address-task",
        "expense-proof-checklist",
        "work-infra-map",
        "missed-risk-alert"
      ],
      postdoc: [
        "research-profile-dashboard",
        "rnd-data-panel",
        "institution-document-pack",
        "research-life-map",
        "lease-basis-mini",
        "tax-prep-mini"
      ]
    };

    for (const [context, modules] of Object.entries(expectedModules)) {
      const html = await composeGenuiArtifactText({ utterance: taggedUtterances[context as keyof typeof taggedUtterances] });

      expect(html).toContain(`data-context="${context}"`);
      expect(html).toContain("context detected");
      expect(html).toContain("<details class=\"drawer\"");

      for (const moduleName of modules) {
        expect(html).toContain(moduleName);
      }
    }
  });

  it("discloses supported tags without fabricating unknown scenarios", async () => {
    const text = await composeGenuiArtifactText({ utterance: "[학생] test" });

    expect(text).toContain("Unsupported pretotype tag.");
    expect(text).toContain("Supported tags: [신혼부부], [프리랜서], [박사후연구원].");
    expect(text).toContain("Pretotype only routes fixed staged prompts by exact tag.");
    expect(text).toContain("No scenario was fabricated.");
  });

  it("does not choose a surface when multiple fixed tags are present", async () => {
    const text = await composeGenuiArtifactText({ utterance: "[신혼부부] [프리랜서] test" });

    expect(text).toContain("Ambiguous pretotype tag.");
    expect(text).toContain("No scenario was fabricated.");
  });

  it("reports missing embedded HTML without trying raw asset fallbacks", async () => {
    await rm(join(dist, "embedded", "freelancer.html"), { force: true });

    const text = await composeGenuiArtifactText({ utterance: "[프리랜서] smoke" });

    expect(text).toContain('Pretotype HTML for tag "[프리랜서]" is not available yet.');
    expect(text).toContain("apps/demo-ui/public/pretotype/embedded");
    expect(text).not.toContain("shared.css");
    expect(text).not.toContain("assets/");
  });
});

function renderEmbeddedFixture(context: string, domains: string[]) {
  return [
    "<!DOCTYPE html>",
    `<html data-context="${context}">`,
    "<head><style>body { color: red; }</style></head>",
    "<body>",
    '<img src="data:image/jpeg;base64,/9j/2Q==" alt="" />',
    "<script>window.__pretotypeToggleLoaded = true;</script>",
    "<p>Tool trace</p>",
    "<p>context detected</p>",
    '<details class="drawer"><summary>trace</summary></details>',
    ...domains.map((domain) => `<a href="https://${domain}" target="_blank" rel="noopener noreferrer">${domain}</a>`),
    "risk-score-panel action-bundle legal-checklist rent-evidence housing-candidate-rail family-life-map",
    "deadline-timeline tax-action-panel business-address-task expense-proof-checklist work-infra-map missed-risk-alert",
    "research-profile-dashboard rnd-data-panel institution-document-pack research-life-map lease-basis-mini tax-prep-mini",
    "</body></html>"
  ].join("");
}

function renderScenarioFixture(context: string, tag: string, html: string) {
  return JSON.stringify(
    {
      id: context,
      tag,
      label: `${context} label`,
      stagedPrompt: `${tag} 대전 유성구로 이사 왔어요.`,
      routePolicy: "exact-tag-only",
      artifact: {
        mode: "self-contained-html",
        html
      },
      assets: [
        {
          id: "fixture-image",
          kind: "image",
          delivery: "inline-data-url",
          format: "jpeg",
          count: 1,
          note: "fixture"
        }
      ],
      surface: {
        headline: `${context} headline`,
        signature: `${context} signature`,
        modules: [`${context}-module`]
      },
      officialHandoffs: [
        {
          label: "handoff",
          domain: "gov.kr",
          purpose: "official handoff"
        }
      ],
      boundaries: ["no fabrication"]
    },
    null,
    2
  );
}
