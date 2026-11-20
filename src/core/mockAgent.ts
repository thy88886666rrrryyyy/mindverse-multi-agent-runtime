import { parseSnapshot } from "./canvas.ts";

export type AgentPhase = "received" | "planning" | "tooling" | "validating" | "completed" | "blocked";
export type AgentEvent = {
  id: string;
  runId: string;
  phase: AgentPhase;
  kind: "stage" | "tool" | "validation" | "error";
  message: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null>;
};
export type MockAgentRequest = {
  runId: string;
  instruction: string;
  snapshot: unknown;
  simulateFailure?: boolean;
};
export type MockAgentTrace = {
  id: string;
  mode: "single-agent-mock";
  status: "completed" | "blocked";
  events: AgentEvent[];
  output?: string;
};

export function runMockAgent(request: MockAgentRequest): MockAgentTrace {
  const events: AgentEvent[] = [];
  const emit = (phase: AgentPhase, kind: AgentEvent["kind"], message: string, metadata?: AgentEvent["metadata"]) => {
    events.push({
      id: `${request.runId}:${events.length + 1}`,
      runId: request.runId,
      phase,
      kind,
      message,
      createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, events.length)).toISOString(),
      ...(metadata ? { metadata } : {}),
    });
  };
  const blocked = (message: string): MockAgentTrace => {
    emit("blocked", "error", message);
    return { id: request.runId, mode: "single-agent-mock", status: "blocked", events };
  };
  emit("received", "stage", "已接收任务；当前为单 Agent 确定性模拟。 ");
  if (!request.runId.trim()) return blocked("运行 ID 不能为空。");
  const instruction = request.instruction.trim();
  if (!instruction || instruction.length > 2000) return blocked("指令须为 1 至 2000 个字符。");
  let snapshot;
  try {
    snapshot = parseSnapshot(request.snapshot);
  } catch {
    return blocked("画布快照校验失败，未执行工具。");
  }
  if (!snapshot.nodes.length) return blocked("请先添加至少一个节点。");
  emit("planning", "stage", "整理当前画布，生成固定格式摘要。", { nodeCount: snapshot.nodes.length });
  emit("tooling", "tool", "调用本地 summarize_canvas 模拟工具。", { tool: "summarize_canvas", attempt: 1 });
  if (request.simulateFailure) return blocked("模拟工具失败；起步包不自动重试。");
  const output = `任务：${instruction}\n画布：${snapshot.projectName}\n节点：${snapshot.nodes.map((node) => node.data.title).join("、")}\n连接：${snapshot.edges.length} 条\n结果：已完成本地结构摘要，未调用模型或生成媒体。`;
  emit("validating", "validation", "摘要已生成，未修改画布或执行外部副作用。");
  emit("completed", "stage", "模拟运行完成。");
  return { id: request.runId, mode: "single-agent-mock", status: "completed", events, output };
}