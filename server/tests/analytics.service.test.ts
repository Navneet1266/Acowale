import { describe, expect, it } from "vitest";
import { buildCategoryBreakdown, buildStatusBreakdown } from "../src/services/analyticsService";

describe("buildCategoryBreakdown", () => {
  it("includes every known category even with zero submissions", () => {
    const breakdown = buildCategoryBreakdown([{ category: "Product", count: 3 }], 3);
    expect(breakdown).toHaveLength(6);
    expect(breakdown.find((c) => c.category === "Billing")?.count).toBe(0);
  });

  it("computes percentages rounded to one decimal place", () => {
    const breakdown = buildCategoryBreakdown(
      [
        { category: "Product", count: 1 },
        { category: "Support", count: 2 },
      ],
      3,
    );
    expect(breakdown.find((c) => c.category === "Product")?.percentage).toBeCloseTo(33.3, 1);
    expect(breakdown.find((c) => c.category === "Support")?.percentage).toBeCloseTo(66.7, 1);
  });

  it("returns 0% for every category when total is zero", () => {
    const breakdown = buildCategoryBreakdown([], 0);
    expect(breakdown.every((c) => c.percentage === 0)).toBe(true);
  });
});

describe("buildStatusBreakdown", () => {
  it("includes every known status even with zero submissions", () => {
    const breakdown = buildStatusBreakdown([{ status: "open", count: 5 }]);
    expect(breakdown).toHaveLength(3);
    expect(breakdown.find((s) => s.status === "resolved")?.count).toBe(0);
    expect(breakdown.find((s) => s.status === "open")?.count).toBe(5);
  });
});
