import { ArrowRight, CircuitBoard, Magnet } from "lucide-react";
import { normalizeCourse } from "@/lib/courses";
import { PURPOSE_LABELS } from "@/lib/constants";
import type { LearningPurpose } from "@/types/learning";

export default function CourseSelector({ initialCourse, initialPurpose }: { initialCourse?: string | null; initialPurpose?: string | null }) {
  const course = normalizeCourse(initialCourse) ?? "em1";
  const purpose = (initialPurpose as LearningPurpose) || "foundation";

  return (
    <form className="onboardingForm" action="/api/onboarding/course" method="post">
      <div className="courseGrid">
        <label className="courseOption">
          <input type="radio" name="course" value="em1" defaultChecked={course === "em1"} />
          <CircuitBoard />
          <strong>電磁気1</strong>
          <span>電場・電位・ガウス・誘電体・回路</span>
        </label>
        <label className="courseOption">
          <input type="radio" name="course" value="em2" defaultChecked={course === "em2"} />
          <Magnet />
          <strong>電磁気2</strong>
          <span>磁場・電磁誘導・インダクタンス・マクスウェル</span>
        </label>
      </div>
      <div className="purposeList">
        {(Object.entries(PURPOSE_LABELS) as Array<[LearningPurpose, string]>).map(([value, label]) => (
          <label key={value} className="radioRow">
            <input type="radio" name="learningPurpose" value={value} defaultChecked={purpose === value} />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <button className="button primaryButton fullButton" type="submit">
        5問診断へ <ArrowRight size={18} />
      </button>
    </form>
  );
}
