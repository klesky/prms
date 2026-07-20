import type { MembershipLevel } from "./authUtils";

export const MEMBERSHIP_LEVELS: MembershipLevel[] = ["SILVER", "GOLD", "PLATINUM"];

const RANK: Record<MembershipLevel, number> = { SILVER: 1, GOLD: 2, PLATINUM: 3 };

export const membershipRank = (level: MembershipLevel) => RANK[level];

export const grantsAccessTo = (userLevel: MembershipLevel, required: MembershipLevel) =>
  RANK[userLevel] >= RANK[required];

export const membershipTagColor: Record<MembershipLevel, string> = {
  SILVER: "default",
  GOLD: "gold",
  PLATINUM: "purple",
};
