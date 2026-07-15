export interface LoginRedirectUser {
  role: string;
  selectedCourse: string | null;
  diagnosticCompleted: boolean;
}

export function getLoginDestination(user: LoginRedirectUser) {
  return user.role === "admin"
    ? "/admin/problems"
    : !user.selectedCourse
      ? "/onboarding/course"
      : !user.diagnosticCompleted
        ? "/onboarding/diagnostic"
        : "/home";
}

export function safeInternalRedirect(value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
