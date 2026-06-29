import CourseSelector from "@/components/CourseSelector";
import { requireUser } from "@/lib/auth/user";

export const metadata = { title: "科目を選択" };
export default async function CoursePage() {
  const user = await requireUser();
  return <div className="narrowPage"><div className="stepHeader"><span>STEP 1 / 2</span><h1>学ぶ科目と目的を選ぶ</h1><p>選択内容は後からマイページで変更できます。</p></div><CourseSelector initialCourse={user.selectedCourse} initialPurpose={user.learningPurpose} /></div>;
}
