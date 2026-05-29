import { describe, expect, it } from "vitest";
import { BenefitSearchRequestSchema } from "./index.js";

describe("BenefitSearchRequestSchema", () => {
  it("parses non-identifying profile conditions", () => {
    const parsed = BenefitSearchRequestSchema.parse({
      query: "서울 거주 대학생 지원",
      profile: {
        region: "서울",
        ageRange: "twenties",
        studentStatus: "student",
        interests: ["education"]
      }
    });

    expect(parsed.profile.studentStatus).toBe("student");
    expect(parsed.profile.employmentStatus).toBe("unknown");
  });
});
