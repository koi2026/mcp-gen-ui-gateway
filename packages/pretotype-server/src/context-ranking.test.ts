import { describe, expect, it } from "vitest";
import { loadPretotypeScenarios } from "./compose-pretotype.js";
import { inferContextVector, rankComponentCandidates } from "./context-ranking.js";
import { createScenarioV2 } from "./source-handoffs.js";

describe("context weighting matrix", () => {
  it("classifies more than the three fixed tags into a structured context vector", () => {
    const cases = [
      {
        utterance: "[신혼부부] 대전 유성구로 이사 왔어요.",
        expected: { household: "newlywed", workStatus: "unknown", lifeEvent: "move" }
      },
      {
        utterance: "[프리랜서] 대전 유성구로 이사 왔어요. 사업장 주소도 바꿔야 해요.",
        expected: { household: "unknown", workStatus: "freelancer", lifeEvent: "move" }
      },
      {
        utterance: "[박사후연구원] 연구과제를 시작하며 대전 유성구로 이사 왔어요.",
        expected: { workStatus: "researcher", lifeEvent: "research-start" }
      },
      {
        utterance: "회사원인데 대전 유성구로 이사 왔어요.",
        expected: { workStatus: "employee", lifeEvent: "move" }
      },
      {
        utterance: "대학생으로 대전 유성구에 전입합니다.",
        expected: { workStatus: "student", lifeEvent: "move" }
      },
      {
        utterance: "가족과 대전 유성구로 이사했고 어린이집 대기도 궁금해요.",
        expected: { household: "family", lifeEvent: "move" }
      },
      {
        utterance: "1인 사업을 시작하면서 대전 유성구 사무실 주소를 등록하려고 해요.",
        expected: { workStatus: "freelancer", lifeEvent: "business-start" }
      }
    ];

    for (const item of cases) {
      expect(inferContextVector(item.utterance)).toMatchObject({
        region: "대전 유성구",
        ...item.expected
      });
    }
  });

  it("ranks component candidates with explicit weights and source references", async () => {
    const scenarios = await loadPretotypeScenarios();
    const freelancer = createScenarioV2(scenarios.find((scenario) => scenario.id === "freelancer")!, {
      generatedAt: "2026-05-30T00:00:00.000Z"
    });
    const context = inferContextVector("[프리랜서] 대전 유성구로 이사 왔어요. 세금 신고가 급해요.");
    const ranking = rankComponentCandidates({
      context,
      scenario: freelancer
    });

    expect(ranking.version).toBe("gateway.ranking.v1");
    expect(ranking.trace.formula).toContain("basePriority");
    expect(ranking.candidates.length).toBeGreaterThanOrEqual(5);
    expect(ranking.selected.length).toBeGreaterThanOrEqual(3);
    expect(ranking.selected[0].score).toBeGreaterThanOrEqual(ranking.selected[1].score);
    expect(ranking.selected.map((candidate) => candidate.id)).toContain("tax-action-panel");

    for (const candidate of ranking.selected) {
      expect(candidate.sourceRefs.length).toBeGreaterThan(0);
      expect(candidate.rationale).toContain("Selected because");
      expect(candidate.weights).toEqual(
        expect.objectContaining({
          personaFit: expect.any(Number),
          lifeEventFit: expect.any(Number),
          regionFit: expect.any(Number),
          urgency: expect.any(Number),
          evidenceConfidence: expect.any(Number),
          actionability: expect.any(Number),
          userFrictionPenalty: expect.any(Number)
        })
      );
    }
  });

  it("does not invent source references for unmapped component modules", async () => {
    const scenarios = await loadPretotypeScenarios();
    const freelancer = createScenarioV2(scenarios.find((scenario) => scenario.id === "freelancer")!, {
      generatedAt: "2026-05-30T00:00:00.000Z"
    });
    const ranking = rankComponentCandidates({
      context: inferContextVector("[프리랜서] 대전 유성구로 이사 왔어요."),
      scenario: {
        ...freelancer,
        surface: {
          ...freelancer.surface,
          modules: ["unmapped-module"]
        }
      }
    });

    expect(ranking.candidates[0]).toMatchObject({
      id: "unmapped-module",
      sourceRefs: [],
      weights: expect.objectContaining({
        evidenceConfidence: 0,
        actionability: 0
      })
    });
    expect(ranking.trace.unmappedModuleIds).toEqual(["unmapped-module"]);
  });
});
