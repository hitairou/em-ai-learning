import { ArrowRight } from "lucide-react";

export default function GuestStartButton({ variant = "primary" }: { variant?: "primary" | "light" | "subtle" }) {
  return (
    <form className="guestStartWrap" action="/api/auth/guest" method="post">
      <button className={`button ${variant === "light" ? "lightButton" : variant === "subtle" ? "subtleButton" : "primaryButton"}`} type="submit">
        ゲストで始める
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
