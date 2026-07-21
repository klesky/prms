import { grantsAccessTo, membershipRank, membershipTagColor, MEMBERSHIP_LEVELS } from "./membership";

describe("MEMBERSHIP_LEVELS", () => {
  it("is ordered from lowest to highest tier", () => {
    expect(MEMBERSHIP_LEVELS).toEqual(["SILVER", "GOLD", "PLATINUM"]);
  });
});

describe("membershipRank", () => {
  it.each([
    ["SILVER", 1],
    ["GOLD", 2],
    ["PLATINUM", 3],
  ] as const)("ranks %s as %i", (level, rank) => {
    expect(membershipRank(level)).toBe(rank);
  });
});

describe("grantsAccessTo", () => {
  it("grants access when the passenger's tier meets the requirement", () => {
    expect(grantsAccessTo("GOLD", "GOLD")).toBe(true);
  });

  it("grants access when the passenger's tier exceeds the requirement (higher tiers inherit lower)", () => {
    expect(grantsAccessTo("PLATINUM", "SILVER")).toBe(true);
    expect(grantsAccessTo("GOLD", "SILVER")).toBe(true);
  });

  it("denies access when the passenger's tier is below the requirement", () => {
    expect(grantsAccessTo("SILVER", "GOLD")).toBe(false);
    expect(grantsAccessTo("GOLD", "PLATINUM")).toBe(false);
  });
});

describe("membershipTagColor", () => {
  it("defines a color for every membership level", () => {
    MEMBERSHIP_LEVELS.forEach((level) => {
      expect(membershipTagColor[level]).toBeTruthy();
    });
  });
});
