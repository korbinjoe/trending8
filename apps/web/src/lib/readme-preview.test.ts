import { describe, expect, it } from "vitest";
import { extractReadmePreviewParagraphs } from "./readme-preview";

describe("extractReadmePreviewParagraphs", () => {
  it("returns first two plain-text paragraphs", () => {
    const md = `# Title

First paragraph about the project.

Second paragraph with more detail.

Third should be dropped.`;
    expect(extractReadmePreviewParagraphs(md)).toEqual([
      "First paragraph about the project.",
      "Second paragraph with more detail.",
    ]);
  });

  it("strips code blocks and markdown links", () => {
    const md = `Intro [link](https://example.com).

\`\`\`ts
const x = 1;
\`\`\`

After code.`;
    expect(extractReadmePreviewParagraphs(md)).toEqual([
      "Intro link.",
      "After code.",
    ]);
  });
});
