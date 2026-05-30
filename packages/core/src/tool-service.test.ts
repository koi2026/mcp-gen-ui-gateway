import { mkdtempSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FixtureBenefitRepository } from "./repository.js";
import { SnapshotStore } from "./sqlite-store.js";
import { BenefitToolService } from "./tool-service.js";

const sqliteIt = canLoadBetterSqlite() ? it : it.skip;

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

  sqliteIt("records SQLite change logs while serving tool calls", async () => {
    const dir = mkdtempSync(join(tmpdir(), "mcp-gen-ui-gateway-"));
    const store = new SnapshotStore(join(dir, "test.db"));
    const service = new BenefitToolService(new FixtureBenefitRepository(), store);

    await service.searchBenefits({ query: "장학금", profile: { studentStatus: "student" } });
    const log = await service.getChangeLog();

    expect(log.entries.length).toBeGreaterThan(0);
    store.close();
  });
});

function canLoadBetterSqlite() {
  try {
    const Database = createRequire(import.meta.url)("better-sqlite3") as typeof import("better-sqlite3");
    const db = new Database(":memory:");
    db.close();
    return true;
  } catch {
    return false;
  }
}
