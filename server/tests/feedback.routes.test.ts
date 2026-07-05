import { beforeAll, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import type { Express } from "express";
import request from "supertest";
import { createTestDb, createTestPool } from "./testDb";

const db = createTestDb();
const testPool = createTestPool(db);

vi.mock("../src/db/pool", () => ({
  pool: testPool,
  checkDbConnection: async () => true,
}));

let app: Express;
let adminToken: string;

beforeAll(async () => {
  const { createApp } = await import("../src/app.js");
  app = createApp();

  const passwordHash = await bcrypt.hash("super-secret-password", 10);
  await testPool.query("INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)", [
    "admin@acowale.com",
    passwordHash,
  ]);

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@acowale.com", password: "super-secret-password" });
  adminToken = loginRes.body.data.token;
});

describe("GET /health", () => {
  it("reports ok when the db is reachable", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("POST /api/feedback", () => {
  it("creates a feedback entry", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({ category: "Product", message: "Loving the new dashboard!", email: "sarah@example.com" });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      category: "Product",
      message: "Loving the new dashboard!",
      status: "open",
    });
  });

  it("rejects an invalid category", async () => {
    const res = await request(app).post("/api/feedback").send({ category: "Nope", message: "hello there" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/feedback", () => {
  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api/feedback");
    expect(res.status).toBe(401);
  });

  it("returns feedback for an authenticated admin", async () => {
    await request(app).post("/api/feedback").send({ category: "Billing", message: "Invoice looks wrong" });

    const res = await request(app).get("/api/feedback").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
  });

  it("filters by category", async () => {
    const res = await request(app)
      .get("/api/feedback?category=Billing")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((f: { category: string }) => f.category === "Billing")).toBe(true);
  });
});

describe("PATCH /api/feedback/:id/status", () => {
  it("updates the status of an existing feedback entry", async () => {
    const created = await request(app)
      .post("/api/feedback")
      .send({ category: "Support", message: "Need help logging in" });
    const id = created.body.data.id;

    const res = await request(app)
      .patch(`/api/feedback/${id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "resolved" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("resolved");
  });

  it("rejects an invalid status value", async () => {
    const created = await request(app)
      .post("/api/feedback")
      .send({ category: "Support", message: "Another support request" });
    const id = created.body.data.id;

    const res = await request(app)
      .patch(`/api/feedback/${id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "archived" });

    expect(res.status).toBe(400);
  });

  it("returns 404 for a non-existent feedback id", async () => {
    const res = await request(app)
      .patch("/api/feedback/00000000-0000-0000-0000-000000000000/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "resolved" });

    expect(res.status).toBe(404);
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).patch("/api/feedback/00000000-0000-0000-0000-000000000000/status").send({
      status: "resolved",
    });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/analytics/submitters", () => {
  it("returns submitters grouped by email plus an anonymous count", async () => {
    await request(app)
      .post("/api/feedback")
      .send({ category: "Product", message: "Repeat submitter test", email: "repeat@example.com" });
    await request(app)
      .post("/api/feedback")
      .send({ category: "Product", message: "Repeat submitter test again", email: "repeat@example.com" });

    const res = await request(app).get("/api/analytics/submitters").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const repeatSubmitter = res.body.data.submitters.find((s: { email: string }) => s.email === "repeat@example.com");
    expect(repeatSubmitter.count).toBeGreaterThanOrEqual(2);
    expect(typeof res.body.data.anonymousCount).toBe("number");
  });
});

describe("PATCH /api/auth/password", () => {
  it("rejects the wrong current password", async () => {
    const res = await request(app)
      .patch("/api/auth/password")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ currentPassword: "wrong-password", newPassword: "brand-new-password" });
    expect(res.status).toBe(400);
  });

  it("changes the password when the current password is correct", async () => {
    const res = await request(app)
      .patch("/api/auth/password")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ currentPassword: "super-secret-password", newPassword: "brand-new-password123" });
    expect(res.status).toBe(200);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@acowale.com", password: "brand-new-password123" });
    expect(loginRes.status).toBe(200);
  });
});

describe("POST /api/auth/login", () => {
  it("rejects an unknown admin", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "nobody@acowale.com", password: "x" });
    expect(res.status).toBe(401);
  });
});
