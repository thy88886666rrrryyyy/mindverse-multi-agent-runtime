import assert from "node:assert/strict";
import test from "node:test";
import { initialSnapshot } from "../src/core/canvas.ts";
import { runMockAgent } from "../src/core/mockAgent.ts";

const request = { runId: "run-1", instruction: "整理参考素材", snapshot: initialSnapshot };

test("single-agent mock is deterministic and does not mutate its input", () => {
  const before = structuredClone(request);
  const trace = runMockAgent(request);
  assert.deepEqual(trace, runMockAgent(request));
  assert.deepEqual(request, before);
  assert.equal(trace.mode, "single-agent-mock");
  assert.equal(trace.status, "completed");
  assert.deepEqual(trace.events.map((event) => event.phase), ["received", "planning", "tooling", "validating", "completed"]);
  assert.equal(new Set(trace.events.map((event) => event.id)).size, trace.events.length);
  assert.ok(trace.events.every((event) => event.runId === request.runId));
  assert.match(trace.output!, /Creative Brief/);
});

test("invalid requests stop before any tool call", () => {
  for (const invalid of [
    { ...request, runId: " " },
    { ...request, instruction: " " },
    { ...request, instruction: "x".repeat(2001) },
    { ...request, snapshot: {} },
    { ...request, snapshot: { ...initialSnapshot, nodes: [], edges: [] } },
  ]) {
    const trace = runMockAgent(invalid);
    assert.equal(trace.status, "blocked");
    assert.equal(trace.events.at(-1)?.kind, "error");
    assert.equal(trace.events.some((event) => event.kind === "tool"), false);
    assert.equal(trace.output, undefined);
  }
});

test("tool failure is explicit and produces no successful result", () => {
  const trace = runMockAgent({ ...request, simulateFailure: true });
  assert.equal(trace.status, "blocked");
  assert.equal(trace.events.at(-1)?.phase, "blocked");
  assert.equal(trace.events.filter((event) => event.kind === "tool").length, 1);
  assert.equal(trace.output, undefined);
  assert.equal(trace.events.some((event) => event.phase === "completed"), false);
});