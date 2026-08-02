"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { safeInternalRedirect } from "@/lib/auth/redirects";

type FormValues = { name: string; email: string; password: string; acceptTerms: boolean; acknowledgePrivacy: boolean };

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const searchParams = useSearchParams();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormValues>();
  const signup = mode === "signup";

  const submit = handleSubmit(async (values) => {
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      setError("root", { message: data.error ?? "処理に失敗しました" });
      return;
    }
    const requested = searchParams.get("next");
    const safeRequested = safeInternalRedirect(requested);
    const responseNext = safeInternalRedirect(typeof data.next === "string" ? data.next : null);
    const destination = signup ? (typeof data.next === "string" ? data.next : "/verify-email") : responseNext || safeRequested || "/home";

    // A full navigation ensures the session cookie is committed before protected data is requested.
    window.location.assign(destination);
  });

  return (
    <form className="authForm" method="post" onSubmit={submit}>
      {signup && (
        <label className="fieldLabel">
          ユーザー名
          <input className="textInput" autoComplete="name" {...register("name", { required: "ユーザー名を入力してください", minLength: { value: 2, message: "2文字以上で入力してください" } })} />
          {errors.name && <span className="fieldError">{errors.name.message}</span>}
        </label>
      )}
      <label className="fieldLabel">
        メールアドレス
        <input className="textInput" type="email" autoComplete="email" {...register("email", { required: "メールアドレスを入力してください" })} />
        {errors.email && <span className="fieldError">{errors.email.message}</span>}
      </label>
      {signup && <div className="consentFields">
        <label className="checkLabel"><input type="checkbox" {...register("acceptTerms", { required: "利用規約への同意が必要です" })} /> <span><Link href="/terms" target="_blank">利用規約</Link>に同意します</span></label>
        <label className="checkLabel"><input type="checkbox" {...register("acknowledgePrivacy", { required: "プライバシーポリシーの確認が必要です" })} /> <span><Link href="/privacy" target="_blank">プライバシーポリシー</Link>を確認しました</span></label>
        {(errors.acceptTerms || errors.acknowledgePrivacy) && <span className="fieldError">利用規約への同意とプライバシーポリシーの確認が必要です</span>}
      </div>}
      <label className="fieldLabel">
        パスワード
        <input className="textInput" type="password" autoComplete={signup ? "new-password" : "current-password"} {...register("password", { required: "パスワードを入力してください", minLength: { value: signup ? 8 : 1, message: "8文字以上で入力してください" } })} />
        {errors.password && <span className="fieldError">{errors.password.message}</span>}
      </label>
      {errors.root && <p className="formError" role="alert">{errors.root.message}</p>}
      <button className="button primaryButton fullButton" disabled={isSubmitting} type="submit">
        {isSubmitting ? "処理中..." : signup ? "アカウントを作成" : "ログイン"}
      </button>
      <p className="authSwitch">
        {signup ? "登録済みですか？" : "初めて利用しますか？"}{" "}
        <Link href={signup ? "/login" : "/signup"}>{signup ? "ログイン" : "アカウント作成"}</Link>
      </p>
    </form>
  );
}
