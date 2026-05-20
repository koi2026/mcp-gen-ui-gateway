import {
  type BenefitRecord,
  type BenefitSearchRequest,
  type BenefitSummary,
  type RecommendationStatus,
  type UserProfile
} from "@mcp-gen-ui-gateway/schema";

export function recommendBenefits(
  benefits: BenefitRecord[],
  request: BenefitSearchRequest
): BenefitSummary[] {
  const queryTerms = tokenize(`${request.query} ${request.profile.interests.join(" ")}`);

  return benefits
    .map((benefit) => scoreBenefit(benefit, request.profile, queryTerms))
    .sort((a, b) => statusRank(a.status) - statusRank(b.status) || b.reasons.length - a.reasons.length);
}

function scoreBenefit(
  benefit: BenefitRecord,
  profile: UserProfile,
  queryTerms: string[]
): BenefitSummary {
  const reasons: string[] = [];
  const missingInfo: string[] = [];
  const blockers: string[] = [];
  const searchable = `${benefit.title} ${benefit.summary} ${benefit.searchableText}`.toLowerCase();

  if (queryTerms.some((term) => searchable.includes(term))) {
    reasons.push("검색어와 혜택 설명이 일치합니다.");
  }

  if (profile.region && benefit.regionTags.length > 0) {
    if (benefit.regionTags.includes(profile.region)) {
      reasons.push(`${profile.region} 지역 조건과 일치합니다.`);
    } else {
      blockers.push(`${profile.region} 지역 대상 혜택이 아닙니다.`);
    }
  } else if (benefit.regionTags.length > 0) {
    missingInfo.push("거주 지역 확인이 필요합니다.");
  }

  if (profile.ageRange && benefit.ageRanges.length > 0) {
    if (benefit.ageRanges.includes(profile.ageRange)) {
      reasons.push("나이대 조건과 일치합니다.");
    } else {
      blockers.push("나이대 조건이 맞지 않을 수 있습니다.");
    }
  } else if (benefit.ageRanges.length > 0) {
    missingInfo.push("나이대 확인이 필요합니다.");
  }

  if (benefit.studentOnly) {
    if (profile.studentStatus === "student") {
      reasons.push("학생 조건과 일치합니다.");
    } else if (profile.studentStatus === "unknown") {
      missingInfo.push("학생 여부 확인이 필요합니다.");
    } else {
      blockers.push("학생 대상 혜택입니다.");
    }
  }

  if (benefit.employmentStatuses.length > 0) {
    if (benefit.employmentStatuses.includes(profile.employmentStatus)) {
      reasons.push("고용 상태 조건과 일치합니다.");
    } else if (profile.employmentStatus === "unknown") {
      missingInfo.push("고용 상태 확인이 필요합니다.");
    } else {
      blockers.push("고용 상태 조건이 맞지 않을 수 있습니다.");
    }
  }

  let status: RecommendationStatus = "candidate";
  if (blockers.length > 0) {
    status = "not_applicable";
  } else if (missingInfo.length > 0 || reasons.length === 0) {
    status = "needs_more_info";
  }

  return {
    id: benefit.id,
    title: benefit.title,
    provider: benefit.provider,
    category: benefit.category,
    summary: benefit.summary,
    status,
    reasons: status === "not_applicable" ? blockers : reasons,
    missingInfo
  };
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[\s,./]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);
}

function statusRank(status: RecommendationStatus): number {
  if (status === "candidate") return 0;
  if (status === "needs_more_info") return 1;
  return 2;
}
