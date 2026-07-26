"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Activity, Waves } from "lucide-react";
import { COURSE_LABELS } from "@/lib/constants";
import type { Course } from "@/types/learning";

const courses: Array<{ value: Course; mark: string; icon: typeof Activity }> = [
  { value: "em1", mark: "I", icon: Activity },
  { value: "em2", mark: "II", icon: Waves },
];

export default function HeaderCourseSwitcher({ current }: { current: Course }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchCourse(course: Course) {
    if (course === current || pending) return;
    startTransition(async () => {
      const response = await fetch("/api/user/course", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course }),
      });
      if (response.ok) router.refresh();
    });
  }

  return (
    <div className="headerCourseSwitch" aria-label="科目切り替え">
      <div className="headerCourseCurrent">
        <span>COURSE</span>
        <strong>{COURSE_LABELS[current]}</strong>
      </div>
      <div className="headerCourseOptions">
        {courses.map((course) => {
          const Icon = course.icon;
          const selected = course.value === current;
          return (
            <button key={course.value} type="button" className={selected ? "selected" : ""} disabled={pending} onClick={() => switchCourse(course.value)} aria-pressed={selected}>
              <Icon size={14} />
              <span>{course.mark}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
