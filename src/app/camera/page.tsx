import { ScanLine } from "lucide-react";
import CameraUploadCard from "@/components/CameraUploadCard";
import { requireCompletedUser } from "@/lib/auth/user";

export const metadata = { title: "写真で質問" };
export default async function CameraPage() {
  await requireCompletedUser();
  return <div className="narrowPage cameraPage"><div className="pageTitle"><ScanLine /><div><span className="eyebrow">ASK FROM PHOTO</span><h1>写真で質問</h1><p>問題を撮るか、画像・PDFを選んでください。答えの前に考え方から整理します。</p></div></div><CameraUploadCard /></div>;
}
