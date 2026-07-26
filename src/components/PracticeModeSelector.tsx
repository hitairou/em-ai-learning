import { BookOpenCheck, Dumbbell, Trophy } from "lucide-react";
import type { PracticeMode } from "@/types/learning";

const modes: Array<{ value: PracticeMode; title: string; text: string; icon: typeof BookOpenCheck }> = [
  { value: "foundation", title: "基礎確認", text: "定義と基本式", icon: BookOpenCheck },
  { value: "standard", title: "標準演習", text: "自力で組み立てる", icon: Dumbbell },
  { value: "exam", title: "試験対策", text: "頻出構造と時間", icon: Trophy },
];

export default function PracticeModeSelector({ value, onChange }: { value: PracticeMode; onChange: (mode: PracticeMode) => void }) {
  return <div className="modeGrid">{modes.map((mode) => {
    const Icon = mode.icon;
    return <button key={mode.value} type="button" className={`${mode.value} ${value === mode.value ? "selected" : ""}`} onClick={() => onChange(mode.value)}><Icon size={18} /><span><strong>{mode.title}</strong><small>{mode.text}</small></span></button>;
  })}</div>;
}
