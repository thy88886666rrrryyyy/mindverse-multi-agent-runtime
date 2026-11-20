export type NodeExecutionStatus = "idle" | "running" | "waiting" | "success" | "error";

export type CanvasNode = {
  id: string;
  type: "creative";
  position: { x: number; y: number };
  data: {
    nodeType: "text" | "image" | "video" | "reference";
    title: string;
    status: NodeExecutionStatus;
    textContent: string;
    imageUrl?: string;
  };
};

export type WorkflowEdge = { id: string; source: string; target: string };
export type CanvasSnapshot = {
  version: 1;
  projectName: string;
  nodes: CanvasNode[];
  edges: WorkflowEdge[];
};

export function parseSnapshot(value: unknown): CanvasSnapshot {
  if (!value || typeof value !== "object") throw new Error("Invalid snapshot");
  const snapshot = value as CanvasSnapshot;
  if (snapshot.version !== 1 || typeof snapshot.projectName !== "string" || !Array.isArray(snapshot.nodes) || !Array.isArray(snapshot.edges)) throw new Error("Invalid snapshot structure");
  const ids = new Set<string>();
  for (const node of snapshot.nodes) {
    if (!node || typeof node.id !== "string" || !node.id || ids.has(node.id) || node.type !== "creative" || !Number.isFinite(node.position?.x) || !Number.isFinite(node.position?.y) || !node.data || !["text", "image", "video", "reference"].includes(node.data.nodeType) || typeof node.data.title !== "string" || typeof node.data.textContent !== "string" || !["idle", "running", "waiting", "success", "error"].includes(node.data.status)) throw new Error("Invalid or duplicate node");
    if (node.data.imageUrl && !node.data.imageUrl.startsWith("/samples/")) throw new Error("Only bundled sample images are allowed in starter snapshots");
    ids.add(node.id);
  }
  const edgeIds = new Set<string>();
  for (const edge of snapshot.edges) {
    if (!edge || typeof edge.id !== "string" || !edge.id || edgeIds.has(edge.id) || !ids.has(edge.source) || !ids.has(edge.target) || edge.source === edge.target) throw new Error("Invalid edge");
    edgeIds.add(edge.id);
  }
  return structuredClone(snapshot);
}

export const initialSnapshot: CanvasSnapshot = {
  version: 1,
  projectName: "Mindverse Research Canvas",
  nodes: [
    { id: "brief", type: "creative", position: { x: 60, y: 120 }, data: { nodeType: "text", title: "Creative Brief", status: "idle", textContent: "A quiet studio. One subject, three camera angles. Keep the same set and subject identity." } },
    { id: "reference", type: "creative", position: { x: 420, y: 120 }, data: { nodeType: "reference", title: "Scene Reference", status: "idle", textContent: "Whitebox composition reference. No generation provider is connected." } },
  ],
  edges: [{ id: "brief-reference", source: "brief", target: "reference" }],
};