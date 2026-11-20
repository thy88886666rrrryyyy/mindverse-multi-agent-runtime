import assert from "node:assert/strict";
import test from "node:test";
import { initialSnapshot, parseSnapshot } from "../src/core/canvas.ts";

test("snapshot roundtrip preserves the graph and isolates mutations", () => {
  const restored = parseSnapshot(JSON.parse(JSON.stringify(initialSnapshot)));
  assert.deepEqual(restored, initialSnapshot);
  restored.nodes[0].data.title = "Changed";
  assert.notEqual(restored.nodes[0].data.title, initialSnapshot.nodes[0].data.title);
});

test("invalid edges, duplicate IDs and invalid positions are rejected", () => {
  assert.throws(() => parseSnapshot({ ...initialSnapshot, edges: [{ id: "bad", source: "missing", target: "brief" }] }));
  assert.throws(() => parseSnapshot({ ...initialSnapshot, nodes: [initialSnapshot.nodes[0], initialSnapshot.nodes[0]] }));
  const snapshot = structuredClone(initialSnapshot);
  snapshot.nodes[0].position.x = Infinity;
  assert.throws(() => parseSnapshot(snapshot));
});

test("import rejects unsupported versions, self-links and duplicate edge IDs", () => {
  assert.throws(() => parseSnapshot({ ...initialSnapshot, version: 2 }));
  assert.throws(() => parseSnapshot({ ...initialSnapshot, edges: [{ id: "self", source: "brief", target: "brief" }] }));
  assert.throws(() => parseSnapshot({ ...initialSnapshot, edges: [initialSnapshot.edges[0], initialSnapshot.edges[0]] }));
});

test("bundled sample image survives JSON roundtrip but remote images are rejected", () => {
  const snapshot = structuredClone(initialSnapshot);
  snapshot.nodes[1].data.imageUrl = "/samples/reference.png";
  assert.deepEqual(parseSnapshot(JSON.parse(JSON.stringify(snapshot))), snapshot);
  snapshot.nodes[1].data.imageUrl = "https://example.com/image.png";
  assert.throws(() => parseSnapshot(snapshot));
});