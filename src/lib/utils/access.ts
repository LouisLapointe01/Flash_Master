import type { Visibility } from "@/lib/types";

type AccessParams = {
  visibility: Visibility;
  isOwner: boolean;
  hasValidShareToken?: boolean;
};

export function canReadSharedContent(params: AccessParams) {
  const { visibility, isOwner, hasValidShareToken = false } = params;

  if (isOwner) return true;

  if (visibility === "public") {
    return true;
  }

  if (visibility === "link_only") {
    return hasValidShareToken;
  }

  if (visibility === "private") {
    return false;
  }

  return false;
}
