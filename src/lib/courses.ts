import { COURSES, type Course } from "@/types/learning";

const COURSE_ALIASES: Record<Course, string[]> = {
  em1: ["em1", "電磁気1", "電磁気Ⅰ", "電磁気I"],
  em2: ["em2", "電磁気2", "電磁気Ⅱ", "電磁気II"],
};

export function normalizeCourse(value: string | null | undefined): Course | null {
  const course = value?.trim();
  if (!course) return null;
  if ((COURSES as readonly string[]).includes(course)) return course as Course;
  for (const [normalized, aliases] of Object.entries(COURSE_ALIASES) as Array<[Course, string[]]>) {
    if (aliases.includes(course)) return normalized;
  }
  return null;
}

export function courseAliases(value: string | null | undefined) {
  const course = normalizeCourse(value);
  return course ? COURSE_ALIASES[course] : [];
}
