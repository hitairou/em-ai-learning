import type { PracticeMode } from "@/types/learning";

const modes: Array<{ value: PracticeMode; title: string; text: string }> = [
  { value: "foundation", title: "基礎確認", text: "定義と基本式を固める" },
  { value: "standard", title: "標準演習", text: "途中式まで自力で組み立てる" },
  { value: "exam", title: "試験対策", text: "頻出構造を時間内に解く" },
];

export default function PracticeModeSelector({ value, onChange }: { value: PracticeMode; onChange: (mode: PracticeMode) => void }) {
  return <div className="modeGrid">{modes.map((mode) => <button key={mode.value} type="button" className={value === mode.value ? "selected" : ""} onClick={() => onChange(mode.value)}><strong>{mode.title}</strong><span>{mode.text}</span></button>)}</div>;
}
