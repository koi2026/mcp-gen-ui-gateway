import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for issue #9.
 *
 * The "인증서비스" link pointed at https://www.gov.kr/member/authCenter, which
 * returns a 404 ("요청하신 페이지를 찾을 수 없습니다"). It is replaced with the
 * gov.kr portal main page, which is stable and avoids the broken auth-center
 * path without leaving a broad homepage handoff in the artifact.
 *
 * The link is duplicated across all three persona artifacts, so this test
 * locks all three at once.
 */
const PERSONA_ARTIFACTS = ["newlywed", "freelancer", "postdoc"] as const;

const BROKEN_HREF = "gov.kr/member/authCenter";
const PORTAL_MAIN_LINK = '<a href="https://www.gov.kr/portal/main"';

function readArtifact(name: string): string {
  const url = new URL(`../assets/embedded/${name}.html`, import.meta.url);
  return readFileSync(fileURLToPath(url), "utf8");
}

describe("issue #9: gov.kr auth center link", () => {
  it.each(PERSONA_ARTIFACTS)(
    "%s.html drops the broken authCenter href",
    (persona) => {
      expect(readArtifact(persona)).not.toContain(BROKEN_HREF);
    },
  );

  it.each(PERSONA_ARTIFACTS)(
    "%s.html points the auth link at the gov.kr portal main page",
    (persona) => {
      expect(readArtifact(persona)).toContain(PORTAL_MAIN_LINK);
    },
  );
});
