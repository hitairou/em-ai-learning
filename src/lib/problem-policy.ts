export const HUMAN_REVIEW_STATUSES = ["unreviewed", "accepted", "needs_fix", "rejected"] as const;
export const VERIFICATION_STATUSES = ["draft", "verified"] as const;

export type HumanReviewStatus = (typeof HUMAN_REVIEW_STATUSES)[number];
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const publishedProblemWhere = {
  isActive: true,
  humanReviewStatus: "accepted",
  verificationStatus: "verified",
  sourceType: { not: "diagnostic" },
} as const;

export function isPublishedProblem(problem: {
  isActive: boolean;
  humanReviewStatus: string;
  verificationStatus: string;
  sourceType?: string;
}) {
  return (
    problem.isActive &&
    problem.humanReviewStatus === "accepted" &&
    problem.verificationStatus === "verified" &&
    problem.sourceType !== "diagnostic"
  );
}

export function enforceReviewState(
  current: {
    humanReviewStatus: string;
    verificationStatus: string;
    isActive: boolean;
  },
  update: {
    humanReviewStatus?: HumanReviewStatus;
    verificationStatus?: VerificationStatus;
    isActive?: boolean;
  },
) {
  const humanReviewStatus = update.humanReviewStatus ?? current.humanReviewStatus;
  const verificationStatus = update.verificationStatus ?? current.verificationStatus;
  const requestedActive = update.isActive ?? current.isActive;
  const canActivate = humanReviewStatus === "accepted" && verificationStatus === "verified";
  const isActive = requestedActive && canActivate;
  const appReadyStatus = canActivate ? (isActive ? "ready" : "ready_inactive") :
    humanReviewStatus === "rejected" ? "rejected" :
    humanReviewStatus === "needs_fix" ? "needs_fix" :
    humanReviewStatus !== "accepted" ? "pending_human_review" : "pending_verification";

  return { humanReviewStatus, verificationStatus, isActive, appReadyStatus };
}
