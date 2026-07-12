import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import RichMathText from "../src/components/RichMathText";

test("renders inline and display LaTeX with KaTeX", () => {
  const html = renderToStaticMarkup(<RichMathText text={"Inline \\(\\frac{a_1^2}{b}\\) and display \\[\\nabla \\cdot \\mathbf{E}=0\\]"} />);
  assert.match(html, /katex/);
  assert.match(html, /katex-display/);
  assert.match(html, /mfrac/);
});

test("falls back only the invalid LaTeX segment", () => {
  const html = renderToStaticMarkup(<RichMathText text={"valid \\(x^2\\), invalid \\(\\notARealCommand{x}\\), tail"} />);
  assert.match(html, /katex/);
  assert.match(html, /notARealCommand/);
  assert.match(html, /tail/);
});
