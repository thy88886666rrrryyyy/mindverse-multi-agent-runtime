import assert from "node:assert/strict";
import test from "node:test";
import { createRuntime } from "../../src/core/runtime/engine.ts";

test("three-plus agents hand off memory, evidence, approval and finish once", () => {
  const runtime = createRuntime("proj-a");
  const snapshot = runtime.run({
    type: "start",
    runId: "run-a",
    projectId: "proj-a",
    instruction: "保持主体身份一致，并整理三机位构图。",
    canvasContext: [{ id: "brief", title: "创意简报", nodeType: "text", excerpt: "同一主体，三个机位。" }],
  });
  const run = snapshot.runs[0];
  assert.equal(run.status, "waiting_approval");
  assert.deepEqual(run.agents.map((agent) => agent.role), ["planner", "retriever", "executor", "reviewer"]);
  assert.ok(run.memory.length >= 1);
  assert.ok(run.evidenceHits.length >= 1);
  assert.ok(run.evidenceHits.every((hit) => hit.version > 0 && hit.documentId));
  assert.equal(run.canvasContext.length, 1);
  assert.equal(run.limits.maxRetries, 1);
  assert.equal(run.limits.maxToolCalls, 6);
  assert.ok(run.limits.toolCallsUsed > 0);

  runtime.run({ type: "approve", runId: "run-a", approved: true });
  const completed = runtime.getSnapshot().runs[0];
  assert.equal(completed.status, "completed");
  assert.equal(completed.sideEffects.length, 1);
  assert.equal(completed.sideEffects[0].requirementVersion, 1);
});

test("failure blocks, recovery avoids duplicate side effect, and stale approval is rejected", () => {
  const runtime = createRuntime("proj-b");
  runtime.run({ type: "start", runId: "run-b", projectId: "proj-b", instruction: "整理主体身份与机位。", options: { simulateFailure: true } });
  const blocked = runtime.getSnapshot().runs[0];
  assert.equal(blocked.status, "blocked");
  assert.equal(blocked.sideEffects.length, 0);

  runtime.run({ type: "recover", runId: "run-b" });
  const waiting = runtime.getSnapshot().runs[0];
  assert.equal(waiting.status, "waiting_approval");

  runtime.run({ type: "update_requirement", runId: "run-b", text: "改为只输出正面机位摘要。" });
  assert.throws(() => runtime.run({ type: "approve", runId: "run-b", approved: true }), /过期|没有待审批/);

  const refreshed = runtime.getSnapshot().runs[0];
  assert.equal(refreshed.approvalRequest, undefined);
  assert.throws(() => runtime.run({ type: "approve", runId: "run-b", approved: true }), /没有待审批/);
  runtime.run({ type: "recover", runId: "run-b" });
  runtime.run({ type: "approve", runId: "run-b", approved: true });
  const completed = runtime.getSnapshot().runs[0];
  assert.equal(completed.status, "completed");
  assert.equal(completed.sideEffects.length, 1);
  assert.equal(completed.sideEffects[0].requirementVersion, 2);
});

test("cancellation prevents side effects and rejects invalid evidence policy", () => {
  const runtime = createRuntime("proj-c");
  runtime.run({ type: "start", runId: "run-c", projectId: "proj-c", instruction: "保持身份一致。" });
  runtime.run({ type: "cancel", runId: "run-c" });
  const cancelled = runtime.getSnapshot().runs[0];
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.sideEffects.length, 0);
  assert.throws(() => runtime.run({ type: "start", runId: "bad", projectId: "proj-c", instruction: "rm -rf /" }), /禁止/);
});

test("deleted or stale evidence is not retrievable", () => {
  const runtime = createRuntime("proj-d");
  const snapshot = runtime.run({ type: "start", runId: "run-d", projectId: "proj-d", instruction: "旧版暖黄色背景配色。" });
  const run = snapshot.runs[0];
  assert.equal(run.evidenceHits.some((hit) => hit.documentId === "doc-stale"), false);
});
