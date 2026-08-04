import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function InfoAppLink() {
  return <Link className="infoAppLink" href="/home"><ArrowLeft size={16} />学習アプリへ戻る</Link>;
}
