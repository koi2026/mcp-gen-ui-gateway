export interface BrowserAssistElement {
  role: string;
  name: string;
  selectorHint?: string;
}

export interface BrowserAssistSnapshot {
  title: string;
  url: string;
  elements: BrowserAssistElement[];
  safetyNotice: string;
}

export interface BrowserAssistPageLike {
  title(): Promise<string>;
  url(): string;
  locator(selector: string): {
    evaluateAll<T>(callback: (nodes: Element[]) => T): Promise<T>;
  };
}

export async function readApplicationStep(page: BrowserAssistPageLike): Promise<BrowserAssistSnapshot> {
  const elements = await page.locator("a, button, input, select, textarea").evaluateAll((nodes) =>
    nodes.slice(0, 50).map((node) => {
      const element = node as HTMLElement;
      return {
        role: element.tagName.toLowerCase(),
        name: element.innerText || element.getAttribute("aria-label") || element.getAttribute("name") || element.getAttribute("placeholder") || "",
        selectorHint: element.id ? `#${element.id}` : undefined
      };
    })
  );

  return {
    title: await page.title(),
    url: page.url(),
    elements,
    safetyNotice: "Experimental browser assist reads the current screen and may suggest user-approved clicks only. It must not store credentials, identity tokens, certificates, or submit applications for the user."
  };
}

export function assertUserApproved(action: string, approved: boolean): void {
  if (!approved) {
    throw new Error(`Browser assist action requires explicit user approval: ${action}`);
  }
}
