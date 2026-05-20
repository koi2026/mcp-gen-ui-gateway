import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FixtureBenefitRepository } from "./repository.js";
import { SnapshotStore } from "./sqlite-store.js";
import { BenefitToolService } from "./tool-service.js";

describe("BenefitToolService", () => {
  it("groups fixture-backed benefit results by recommendation status", async () => {
    const service = new BenefitToolService(new FixtureBenefitRepository());

    const response = await service.searchBenefits({
      query: "서울 대학생 주거 지원",
      profile: {
        region: "서울",
        ageRange: "twenties",
        studentStatus: "student",
        interests: ["housing", "education"]
      }
    });

    expect(response.results[0]?.status).toBe("candidate");
    expect(response.results.map((result) => result.id)).toContain("seoul-youth-rent-support");
  });

  it("records SQLite change logs while serving tool calls", async () => {
    const dir = mkdtempSync(join(tmpdir(), "mcp-gen-ui-gateway-"));
    const store = new SnapshotStore(join(dir, "test.db"));
    const service = new BenefitToolService(new FixtureBenefitRepository(), store);

    await service.searchBenefits({ query: "장학금", profile: { studentStatus: "student" } });
    const log = await service.getChangeLog();

    expect(log.entries.length).toBeGreaterThan(0);
    store.close();
  });
});
