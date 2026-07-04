import { describe, expect, it } from "vitest";
import { createFeedbackSchema, listFeedbackQuerySchema } from "../src/schemas/feedback.schema";

describe("createFeedbackSchema", () => {
  it("accepts a valid submission", () => {
    const result = createFeedbackSchema.safeParse({
      category: "Product",
      message: "The dashboard is great!",
      email: "user@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a submission without an email", () => {
    const result = createFeedbackSchema.safeParse({
      category: "Support",
      message: "Need help with billing",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown category", () => {
    const result = createFeedbackSchema.safeParse({
      category: "Marketing",
      message: "This should fail",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a message that is too short", () => {
    const result = createFeedbackSchema.safeParse({
      category: "Product",
      message: "Hi",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email format", () => {
    const result = createFeedbackSchema.safeParse({
      category: "Product",
      message: "Valid message here",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("listFeedbackQuerySchema", () => {
  it("applies defaults for pagination", () => {
    const result = listFeedbackQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("coerces string query params to numbers", () => {
    const result = listFeedbackQuerySchema.parse({ page: "3", pageSize: "10" });
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(10);
  });

  it("rejects a pageSize above the max", () => {
    const result = listFeedbackQuerySchema.safeParse({ pageSize: "500" });
    expect(result.success).toBe(false);
  });
});
