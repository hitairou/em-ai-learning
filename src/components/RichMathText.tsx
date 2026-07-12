import katex from "katex";

const mathPattern = /\\\[((?:.|\n)*?)\\\]|\\\(((?:.|\n)*?)\\\)/g;

export default function RichMathText({ text, className }: { text: string; className?: string }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = mathPattern.exec(text)) !== null) {
    if (match.index > cursor) parts.push(<span key={`text-${cursor}`}>{text.slice(cursor, match.index)}</span>);
    const displayMode = match[1] !== undefined;
    const formula = (match[1] ?? match[2]).trim();
    let rendered: string | null = null;
    try {
      rendered = katex.renderToString(formula, { displayMode, throwOnError: true, trust: false });
    } catch {}
    if (rendered) {
      parts.push(<span key={`math-${match.index}`} className={displayMode ? "mathDisplay" : "mathInline"} dangerouslySetInnerHTML={{ __html: rendered }} />);
    } else {
      parts.push(<span key={`fallback-${match.index}`}>{match[0]}</span>);
    }
    cursor = mathPattern.lastIndex;
  }
  if (cursor < text.length) parts.push(<span key={`text-${cursor}`}>{text.slice(cursor)}</span>);
  return <span className={className}>{parts}</span>;
}
