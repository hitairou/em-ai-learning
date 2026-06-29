"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CircuitBoard, Magnet } from "lucide-react";
import { PURPOSE_LABELS } from "@/lib/constants";
import type { Course, LearningPurpose } from "@/types/learning";

export default function CourseSelector({ initialCourse, initialPurpose }: { initialCourse?: string | null; initialPurpose?: string | null }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course>((initialCourse as Course) || "em1");
  const [purpose, setPurpose] = useState<LearningPurpose>((initialPurpose as LearningPurpose) || "foundation");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/onboarding/course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course, learningPurpose: purpose }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "保存できませんでした");
      setSubmitting(false);
      return;
    }
    router.push("/onboarding/diagnostic");
    router.refresh();
  }

  return (
    <div className="onboardingForm">
      <div className="courseGrid">
        <button className={`courseOption ${course === "em1" ? "selected" : ""}`} onClick={() => setCourse("em1")} type="button">
          <CircuitBoard />
          <strong>電磁気1</strong>
          <span>電場・電位・ガウス・誘電体・回路</span>
        </button>
        <button className={`courseOption ${course === "em2" ? "selected" : ""}`} onClick={() => setCourse("em2")} type="button">
          <Magnet />
          <strong>電磁気2</strong>
          <span>磁場・電磁誘導・インダクタンス・マクスウェル</span>
        </button>
      </div>
      <div className="purposeList">
        {(Object.entries(PURPOSE_LABELS) as Array<[LearningPurpose, string]>).map(([value, label]) => (
          <label key={value} className={`radioRow ${purpose === value ? "selected" : ""}`}>
            <input type="radio" name="purpose" checked={purpose === value} onChange={() => setPurpose(value)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
      {error && <p className="formError">{error}</p>}
      <button className="button primaryButton fullButton" type="button" disabled={submitting} onClick={submit}>
        {submitting ? "保存中..." : <>5問診断へ <ArrowRight size={18} /></>}
      </button>
    </div>
  );
}
