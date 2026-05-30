import { describe, expect, it } from "vitest";
import { loadPretotypeScenarios } from "./compose-pretotype.js";
import { createScenarioV2, validateOfficialHandoffs } from "./source-handoffs.js";

describe("official handoff source metadata", () => {
  it("upgrades fixed scenario manifests to pretotype.scenario.v2 with traceable official handoffs", async () => {
    const scenarios = await loadPretotypeScenarios();

    for (const scenario of scenarios) {
      const scenarioV2 = createScenarioV2(scenario, {
        generatedAt: "2026-05-30T00:00:00.000Z",
        resolverVersion: "test"
      });

      expect(scenarioV2.version).toBe("pretotype.scenario.v2");
      expect(scenarioV2.context).toMatchObject({
        tag: scenario.tag,
        region: "대전 유성구",
        lifeEvent: "move"
      });
      expect(scenarioV2.route.policy).toBe("exact-tag-only");
      expect(scenarioV2.artifact).toEqual(scenario.artifact);
      expect(scenarioV2.diagnostics.unresolvedCount).toBe(0);

      for (const handoff of scenarioV2.officialHandoffs) {
        expect(handoff.id).toMatch(new RegExp(`^${scenario.id}-handoff-`));
        expect(handoff.url).toMatch(/^https:\/\//);
        expect(handoff.status).toBe("verified");
        expect(handoff.confidence).toBe("high");
        expect(handoff.sourceRefs).toHaveLength(1);
        expect(handoff.sourceRefs[0]).toMatch(new RegExp(`^source:${scenario.id}:`));
        expect(typeof handoff.requiresLogin).toBe("boolean");
        expect(handoff.userAction).toMatch(/^(read|apply|download|check|reserve)$/);
      }
    }
  });

  it("flags broad or inconsistent official handoff URLs without changing Stage 0 HTML routing", async () => {
    const [scenario] = await loadPretotypeScenarios();
    const validation = validateOfficialHandoffs({
      ...scenario,
      officialHandoffs: [
        ...scenario.officialHandoffs,
        {
          label: "bad homepage",
          domain: "gov.kr",
          url: "https://www.gov.kr/",
          purpose: "too broad"
        },
        {
          label: "wrong domain",
          domain: "gov.kr",
          url: "https://example.com/service",
          purpose: "domain mismatch"
        }
      ]
    });

    expect(validation.status).toBe("manual-review");
    expect(validation.unresolvedCount).toBe(2);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "broad-homepage", label: "bad homepage" }),
        expect.objectContaining({ code: "domain-mismatch", label: "wrong domain" })
      ])
    );
  });
});
