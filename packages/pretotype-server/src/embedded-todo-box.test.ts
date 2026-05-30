import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for issue #10.
 *
 * The checklist checkmark SVG animates `transform: scale(.6) -> scale(1)`.
 * Without an explicit `transform-origin`, the default `50% 50%` drifts off the
 * visual center because of the box model + SVG inner padding, so the checkmark
 * looks misaligned. The fix pins the origin with `transform-origin: center`.
 *
 * The same markup is duplicated across all three persona artifacts, so the
 * fix is easy to apply to two files and silently miss the third — this test
 * locks all three at once.
 */
const PERSONA_ARTIFACTS = ["newlywed", "freelancer", "postdoc"] as const;

const TODO_BOX_SVG_RULE = /\.todo-box svg \{[^}]*\}/;

function readArtifact(name: string): string {
  const url = new URL(`../assets/embedded/${name}.html`, import.meta.url);
  return readFileSync(fileURLToPath(url), "utf8");
}

describe("issue #10: checklist checkbox transform-origin", () => {
  it.each(PERSONA_ARTIFACTS)(
    "%s.html pins .todo-box svg transform-origin to center",
    (persona) => {
      const html = readArtifact(persona);
      const rule = html.match(TODO_BOX_SVG_RULE);

      expect(rule, `.todo-box svg rule not found in ${persona}.html`).not.toBeNull();
      expect(rule?.[0]).toContain("transform-origin: center");
    },
  );
});
