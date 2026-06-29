"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

type FormValues = { name: string; email: string; password: string };

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormValues>();
  const signup = mode === "signup";

  const submit = handleSubmit(async (values) => {
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      setError("root", { message: data.error ?? "処理に失敗しました" });
      return;
    }
    const requested = searchParams.get("next");
    router.push(signup ? "/onboarding/course" : requested || data.next || "/home");
    router.refresh();
  });

  return (
    <form className="authForm" onSubmit={submit}>
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
