import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import RichMathText from "../src/components/RichMathText";
import TodayTaskCard from "../src/components/TodayTaskCard";

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

test("renders today's recommended problem text with KaTeX", () => {
  const html = renderToStaticMarkup(
    <TodayTaskCard
      problem={{
        id: "problem-1",
        title: "電場の大きさ",
        topic: "クーロンの法則",
        difficulty: 2,
        questionText: "点電荷の電場 \\(E = \\frac{kQ}{r^2}\\) を求めよ。",
      }}
    />,
  );
  assert.match(html, /katex/);
  assert.doesNotMatch(html, /\\\(E =/);
});
