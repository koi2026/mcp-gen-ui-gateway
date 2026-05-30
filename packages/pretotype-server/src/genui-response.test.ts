import { describe, expect, it } from "vitest";
import { composeGenuiArtifactText, loadPretotypeScenarios } from "./compose-pretotype.js";
import { composeDynamicGenuiResponse, composeDynamicGenuiResponseFromScenarios, renderDynamicGenuiHtml } from "./genui-response.js";

describe("dynamic GenUI response renderer", () => {
  it("builds a versioned GenUIResponse from context, sources, evidence, ranking, and renderable blocks", async () => {
    const response = await composeDynamicGenuiResponse({
      utterance: "[신혼부부] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.",
      generatedAt: "2026-05-30T00:00:00.000Z"
    });

    expect(response.run).toMatchObject({
      status: "success",
      userQuery: expect.stringContaining("[신혼부부]"),
      contractVersion: "genui.gateway.v1"
    });
    expect(response.context).toMatchObject({
      household: "newlywed",
      region: "대전 유성구"
    });
    expect(response.sources.length).toBeGreaterThan(0);
    expect(response.evidence.length).toBeGreaterThan(0);
    expect(response.blocks.map((block) => block.type)).toEqual(
      expect.arrayContaining(["summary", "action-checklist", "service-card-list", "handoff-link-list", "notice"])
    );

    for (const block of response.blocks) {
      expect(block.sourceRefs.length).toBeGreaterThan(0);
      expect(block.evidenceRefs.length).toBeGreaterThan(0);
      const allowedEvidenceRefs = response.evidence
        .filter((evidence) => block.sourceRefs.includes(evidence.sourceId))
        .map(({ id }) => id);
      expect(block.evidenceRefs.every((evidenceRef) => allowedEvidenceRefs.includes(evidenceRef))).toBe(true);
    }

    expect(response.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tool: "ranking",
          status: "success"
        })
      ])
    );
  });

  it("renders a dynamic self-contained HTML template without mutating the Stage 0 fixed artifact path", async () => {
    const utterance = "[프리랜서] 대전 유성구로 이사 왔어요. 세금 신고와 사업장 주소 변경을 한 곳에서 보고 싶어요.";
    const stage0Html = await composeGenuiArtifactText({ utterance });
    const response = await composeDynamicGenuiResponse({
      utterance,
      generatedAt: "2026-05-30T00:00:00.000Z"
    });
    const dynamicHtml = renderDynamicGenuiHtml(response);

    expect(dynamicHtml.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(dynamicHtml).toContain('data-contract-version="genui.gateway.v1"');
    expect(dynamicHtml).toContain("tax-action-panel");
    expect(dynamicHtml).toContain("ranking trace");
    expect(dynamicHtml).toContain("공식 출처");
    expect(dynamicHtml).not.toContain("<script");
    expect(dynamicHtml).not.toContain("<link");
    expect(dynamicHtml).not.toEqual(stage0Html);
    expect(stage0Html).toContain("프리랜서 5월 이사");
  });

  it("returns a partial GenUIResponse instead of fabricating a persona for unsupported prompts", async () => {
    const response = await composeDynamicGenuiResponse({
      utterance: "대전 유성구로 이사 왔어요.",
      generatedAt: "2026-05-30T00:00:00.000Z"
    });
    const html = renderDynamicGenuiHtml(response);

    expect(response.run.status).toBe("partial");
    expect(response.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unsupported-pretotype-tag",
          retryable: true
        })
      ])
    );
    expect(response.blocks).toHaveLength(1);
    expect(response.blocks[0]).toMatchObject({
      type: "notice",
      title: "지원되는 pretotype tag가 필요합니다"
    });
    expect(html).toContain("[신혼부부]");
    expect(html).toContain("[프리랜서]");
    expect(html).toContain("[박사후연구원]");
  });

  it("can route broader context prompts through ContextVector without changing the Stage 0 exact-tag artifact path", async () => {
    const response = await composeDynamicGenuiResponse({
      utterance: "신혼부부가 대전 유성구로 이사 왔어요. 이사 관련 행정과 동네 데이터를 한 곳에서 보고 싶어요.",
      generatedAt: "2026-05-30T00:00:00.000Z"
    });

    expect(response.run.status).toBe("success");
    expect(response.context).toMatchObject({
      household: "newlywed",
      region: "대전 유성구"
    });
    expect(response.blocks[0]?.title).toContain("신혼부부");
    expect(response.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tool: "route",
          status: "partial",
          detail: expect.stringContaining("context-vector")
        })
      ])
    );
  });

  it("prioritizes explicit persona context over generic risk-focus routing", async () => {
    const response = await composeDynamicGenuiResponse({
      utterance: "프리랜서가 대전 유성구로 전세집 이사 왔어요. 세금 신고와 확정일자를 같이 보고 싶어요.",
      generatedAt: "2026-05-30T00:00:00.000Z"
    });

    expect(response.run.status).toBe("success");
    expect(response.context).toMatchObject({
      workStatus: "freelancer",
      housingStatus: "jeonse"
    });
    expect(response.blocks[0]?.title).toContain("프리랜서");
  });

  it("surfaces official handoff validation issues as partial GenUI errors", async () => {
    const [scenario] = await loadPretotypeScenarios();
    const response = composeDynamicGenuiResponseFromScenarios({
      utterance: `${scenario.tag} 대전 유성구로 이사 왔어요.`,
      generatedAt: "2026-05-30T00:00:00.000Z",
      scenarios: [
        {
          ...scenario,
          officialHandoffs: [
            ...scenario.officialHandoffs,
            {
              label: "bad homepage",
              domain: "gov.kr",
              url: "https://www.gov.kr/",
              purpose: "too broad"
            }
          ]
        }
      ]
    });

    expect(response.run.status).toBe("partial");
    expect(response.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "handoff-broad-homepage",
          retryable: true,
          scope: "source-handoff"
        })
      ])
    );
    expect(response.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tool: "source-handoffs",
          status: "partial",
          detail: expect.stringContaining("unresolved=1")
        })
      ])
    );
  });

  it("returns a failed GenUIResponse when scenario metadata cannot be loaded", async () => {
    const originalDist = process.env.MCP_GEN_UI_PRETOTYPE_DIST;
    process.env.MCP_GEN_UI_PRETOTYPE_DIST = "/tmp/missing-pretotype-scenarios";

    try {
      const response = await composeDynamicGenuiResponse({
        utterance: "[신혼부부] 대전 유성구로 이사 왔어요.",
        generatedAt: "2026-05-30T00:00:00.000Z"
      });

      expect(response.run.status).toBe("failed");
      expect(response.blocks).toHaveLength(1);
      expect(response.blocks[0]).toMatchObject({
        type: "notice",
        title: "Pretotype scenario metadata를 읽을 수 없습니다"
      });
      expect(response.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "pretotype-scenario-load-failed",
            retryable: true,
            scope: "scenario"
          })
        ])
      );
    } finally {
      if (originalDist === undefined) {
        delete process.env.MCP_GEN_UI_PRETOTYPE_DIST;
      } else {
        process.env.MCP_GEN_UI_PRETOTYPE_DIST = originalDist;
      }
    }
  });

  it("escapes dynamic text and suppresses unsafe links in the HTML template", () => {
    const html = renderDynamicGenuiHtml({
      run: {
        id: "xss-check",
        status: "success",
        generatedAt: "2026-05-30T00:00:00.000Z",
        userQuery: "<script>alert(1)</script>",
        contractVersion: "genui.gateway.v1"
      },
      context: {},
      blocks: [
        {
          id: "unsafe",
          type: "handoff-link-list",
          title: "<img src=x onerror=alert(1)>",
          items: [
            {
              id: "unsafe-item",
              label: "<b>bad</b>",
              description: "<script>alert(2)</script>",
              href: "javascript:alert(3)"
            },
            {
              id: "http-item",
              label: "http bad",
              description: "http should be suppressed",
              href: "http://example.com"
            }
          ],
          sourceRefs: [],
          evidenceRefs: []
        }
      ],
      sources: [
        {
          id: "source:unsafe",
          provider: "<svg onload=alert(4)>",
          dataset: "unsafe",
          serviceType: "test",
          format: "official-url",
          status: "verified",
          retrievedAt: "2026-05-30T00:00:00.000Z",
          lastUpdated: "2026-05-30T00:00:00.000Z",
          uri: "javascript:alert(5)"
        },
        {
          id: "source:http",
          provider: "http provider",
          dataset: "unsafe http",
          serviceType: "test",
          format: "official-url",
          status: "verified",
          retrievedAt: "2026-05-30T00:00:00.000Z",
          lastUpdated: "2026-05-30T00:00:00.000Z",
          uri: "http://example.com"
        }
      ],
      evidence: [],
      errors: []
    });

    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("http://example.com");
    expect(html).toContain("&lt;b&gt;bad&lt;/b&gt;");
    expect(html).toContain("&lt;svg onload=alert(4)&gt;");
  });
});
