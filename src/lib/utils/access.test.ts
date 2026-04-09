import { describe, expect, it } from "vitest";
import { canReadSharedContent } from "@/lib/utils/access";

describe("canReadSharedContent", () => {
  it("always allows owner access", () => {
    expect(canReadSharedContent({ visibility: "private", isOwner: true })).toBe(true);
    expect(canReadSharedContent({ visibility: "public", isOwner: true })).toBe(true);
  });

  it("allows public content for non-owner", () => {
    expect(canReadSharedContent({ visibility: "public", isOwner: false })).toBe(true);
  });

  it("requires a valid token for link_only", () => {
    expect(canReadSharedContent({ visibility: "link_only", isOwner: false, hasValidShareToken: true })).toBe(true);
    expect(canReadSharedContent({ visibility: "link_only", isOwner: false, hasValidShareToken: false })).toBe(false);
  });

  it("blocks private content for non-owner", () => {
    expect(canReadSharedContent({ visibility: "private", isOwner: false })).toBe(false);
  });
});
