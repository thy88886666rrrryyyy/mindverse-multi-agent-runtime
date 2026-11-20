import { retrieveEvidence, searchMemory } from "./memory.ts";
import { cloneSnapshot, createInitialSnapshot, validateText } from "./store.ts";
import type {
  AgentRole, Approval, CanvasContextItem, EvidenceHit, RequirementVersion, RunRecord,
  RuntimeCommand, RuntimeEvent, RuntimeSnapshot, RunStatus,
} from "./types.ts";

const ROLES: AgentRole[] = ["planner", "retriever", "executor", "reviewer"];
const MAX_RETRIES = 1;
const MAX_TOOL_CALLS = 6;

export class MultiAgentRuntime {
  private snapshot: RuntimeSnapshot;

  constructor(projectId = "mindverse-demo") {
    this.snapshot = createInitialSnapshot(projectId);
  }

  getSnapshot(): RuntimeSnapshot {
    return cloneSnapshot(this.snapshot);
  }

  run(command: RuntimeCommand): RuntimeSnapshot {
    const next = cloneSnapshot(this.snapshot);
    if (command.type === "start") this.start(next, command);
    else if (command.type === "update_requirement") this.updateRequirement(next, command.runId, command.text);
    else if (command.type === "approve") this.approve(next, command.runId, command.approved, command.note);
    else if (command.type === "cancel") this.cancel(next, command.runId);
    else if (command.type === "recover") this.recover(next, command.runId);
    this.snapshot = next;
    return this.getSnapshot();
  }

  private findRun(runs: RunRecord[], runId: string): RunRecord {
    const run = runs.find((item) => item.id === runId);
    if (!run) throw new Error("运行记录不存在");
    return run;
  }

  private start(next: RuntimeSnapshot, command: Extract<RuntimeCommand, { type: "start" }>): void {
    const now = command.options?.now ?? new Date().toISOString();
    const runId = validateText(command.runId, "运行 ID", 80);
    const projectId = validateText(command.projectId, "项目 ID", 80);
    const instruction = validateText(command.instruction, "任务指令");
    const canvasContext = (command.canvasContext ?? []).map((item) => ({
      id: validateText(item.id, "节点 ID", 80),
      title: validateText(item.title, "节点标题", 120),
      nodeType: validateText(item.nodeType, "节点类型", 40),
      excerpt: item.excerpt.slice(0, 160),
    }));
    this.guardHostileCommand(instruction);
    if (next.runs.some((run) => run.id === runId)) throw new Error("运行 ID 已存在；请使用 recover 恢复已有运行");

    const requirement: RequirementVersion = { version: 1, text: instruction, updatedAt: now };
    const run: RunRecord = {
      id: runId,
      projectId,
      status: "running",
      requirement,
      agents: ROLES.map((role) => ({ role, status: "idle", summary: "待调度" })),
      events: [],
      memory: searchMemory(next.memories, projectId, instruction),
      evidence: next.evidence.filter((doc) => doc.projectId === projectId),
      evidenceHits: [],
      sideEffects: [],
      canvasContext,
      limits: { maxRetries: MAX_RETRIES, maxToolCalls: MAX_TOOL_CALLS, toolCallsUsed: 0, recoveryCount: 0 },
      recoveryCount: 0,
      failureInjected: command.options?.simulateFailure,
    };
    next.runs.unshift(run);
    this.emit(run, "system", "running", "stage", "已创建运行记录，需求版本 v1。");
    this.dispatch(next, run, now, command.options?.requireApproval !== false);
  }

  private updateRequirement(next: RuntimeSnapshot, runId: string, text: string): void {
    const run = this.findRun(next.runs, runId);
    const updated = validateText(text, "更新后的需求");
    if (run.status === "completed" || run.status === "cancelled") throw new Error("已完成或已取消的运行不能修改需求");
    run.requirement = { version: run.requirement.version + 1, text: updated, updatedAt: new Date().toISOString() };
    run.approval = undefined;
    run.approvalRequest = undefined;
    this.emit(run, "system", run.status === "waiting_approval" ? "waiting_approval" : "running", "stage", `需求已更新为 v${run.requirement.version}；旧审批与旧审批请求已作废，副作用需按当前版本重新确认。`, { requirementVersion: run.requirement.version });
  }

  private approve(next: RuntimeSnapshot, runId: string, approved: boolean, note?: string): void {
    const run = this.findRun(next.runs, runId);
    if (run.status !== "waiting_approval" || !run.approvalRequest) throw new Error("当前没有待审批的副作用");
    if (run.approvalRequest.requirementVersion !== run.requirement.version) throw new Error("审批对应的需求版本已过期；请重新请求审批");
    const approval: Approval = {
      requestId: run.approvalRequest.id,
      approved,
      approvedAt: new Date().toISOString(),
      requirementVersion: run.requirement.version,
      note: note?.trim() || undefined,
    };
    run.approval = approval;
    if (!approved) {
      run.status = "blocked";
      this.setAgent(run, "executor", "error", "用户拒绝了限定副作用。");
      this.emit(run, "executor", "blocked", "approval", "审批被拒绝；未执行模拟副作用。");
      return;
    }
    this.emit(run, "executor", "running", "approval", `已批准范围：${run.approvalRequest.scope}。`, { requirementVersion: run.requirement.version });
    this.executeSideEffect(next, run);
    this.review(next, run);
  }

  private cancel(next: RuntimeSnapshot, runId: string): void {
    const run = this.findRun(next.runs, runId);
    if (run.status === "completed" || run.status === "cancelled") return;
    run.status = "cancelled";
    run.cancelledAt = new Date().toISOString();
    ROLES.forEach((role) => { if (run.agents.find((agent) => agent.role === role)?.status !== "success") this.setAgent(run, role, "waiting", "已取消"); });
    this.emit(run, "system", "cancelled", "stage", "运行已取消；未登记新的模拟副作用。");
  }

  private recover(next: RuntimeSnapshot, runId: string): void {
    const run = this.findRun(next.runs, runId);
    if (run.status !== "blocked" && run.status !== "waiting_approval") throw new Error("只有阻塞或等待重新确认的运行可以恢复");
    run.recoveryCount += 1;
    run.limits.recoveryCount = run.recoveryCount;
    run.status = "running";
    this.emit(run, "system", "running", "stage", `从阻塞状态恢复，第 ${run.recoveryCount} 次恢复。`, { recoveryCount: run.recoveryCount });
    const now = new Date().toISOString();
    this.dispatch(next, run, now, true);
  }

  private dispatch(next: RuntimeSnapshot, run: RunRecord, now: string, requireApproval: boolean): void {
    this.plan(next, run, now);
    this.retrieve(next, run);
    this.execute(next, run, now, requireApproval);
    if (run.status === "running") this.review(next, run);
  }

  private plan(next: RuntimeSnapshot, run: RunRecord, now: string): void {
    this.setAgent(run, "planner", "running", "拆解需求并检查长期记忆。");
    this.emit(run, "planner", "running", "stage", "规划角色：澄清目标、识别约束、准备交接给检索角色。");
    if (run.canvasContext.length > 0) {
      this.emit(run, "planner", "running", "stage", `读取画布上下文：${run.canvasContext.length} 个节点。`, { nodeIds: run.canvasContext.map((item) => item.id) });
      run.canvasContext.forEach((item) => this.emit(run, "planner", "running", "stage", `${item.title}（${item.nodeType}）：${item.excerpt}`, { nodeId: item.id }));
    } else {
      this.emit(run, "planner", "running", "stage", "本次运行没有附带画布节点上下文。");
    }
    const memoryLines = run.memory.map((item) => `${item.kind}#${item.id} v${item.version}: ${item.text}`);
    this.emit(run, "planner", "running", "memory", `命中 ${run.memory.length} 条长期记忆。`, { memoryIds: run.memory.map((item) => item.id) });
    memoryLines.forEach((line) => this.emit(run, "planner", "running", "memory", line));
    this.setAgent(run, "planner", "success", `已整理 ${run.memory.length} 条记忆约束和 ${run.canvasContext.length} 个画布节点。`);
  }

  private retrieve(next: RuntimeSnapshot, run: RunRecord): void {
    this.setAgent(run, "retriever", "running", "从项目范围内检索 RAG 证据。");
    const hits = retrieveEvidence(next.evidence, run.projectId, run.requirement.text);
    run.evidenceHits = hits;
    this.emit(run, "retriever", "running", "evidence", `检索到 ${hits.length} 条未删除证据；已忽略旧版本与删除文档。`, { hitCount: hits.length });
    hits.forEach((hit) => this.emit(run, "retriever", "running", "evidence", `${hit.title} v${hit.version}`, { documentId: hit.documentId, version: hit.version, score: hit.score, source: hit.source }));
    this.guardHostileEvidence(hits);
    this.setAgent(run, "retriever", "success", `返回 ${hits.length} 条带来源和版本的证据。`);
  }

  private guardHostileEvidence(hits: EvidenceHit[]): void {
    const hostile = hits.find((hit) => /ignore previous|忽略此前|执行任意|shell|secret/i.test(hit.excerpt));
    if (hostile) throw new Error(`不可信证据被拦截：${hostile.documentId}`);
  }

  private execute(next: RuntimeSnapshot, run: RunRecord, now: string, requireApproval: boolean): void {
    this.setAgent(run, "executor", "running", "校验工具参数并执行本地只读/模拟动作。");
    if (run.failureInjected && run.recoveryCount === 0) {
      run.status = "blocked";
      this.setAgent(run, "executor", "error", "模拟工具结果不确定，等待恢复。");
      this.emit(run, "executor", "blocked", "error", "注入故障：本地工具返回不确定结果；未登记副作用。", { maxRetries: MAX_RETRIES, maxToolCalls: MAX_TOOL_CALLS, toolCallsUsed: run.limits.toolCallsUsed });
      return;
    }
    this.recordToolCall(run, "summarize_canvas", "调用本地只读工具 summarize_canvas。");
    this.recordToolCall(run, "draft_summary", "调用本地模拟工具 draft_summary。");

    const sideEffect = {
      action: "persist_draft",
      scope: `${run.projectId}:draft`,
      requirementVersion: run.requirement.version,
    };

    if (requireApproval) {
      run.approvalRequest = {
        id: `approval-${run.id}`,
        action: sideEffect.action,
        scope: sideEffect.scope,
        requirementVersion: run.requirement.version,
        createdAt: now,
      };
      run.status = "waiting_approval";
      this.setAgent(run, "executor", "waiting", "等待限定范围审批。");
      this.emit(run, "executor", "waiting_approval", "approval", "模拟写入副作用需要明确审批；旧审批不能覆盖变更后的需求。", { action: sideEffect.action, scope: sideEffect.scope, requirementVersion: sideEffect.requirementVersion });
      return;
    }

    this.executeSideEffect(next, run);
  }

  private recordToolCall(run: RunRecord, tool: string, message: string): void {
    if (run.limits.toolCallsUsed >= run.limits.maxToolCalls) {
      run.status = "blocked";
      this.setAgent(run, "executor", "error", "已达到工具调用上限。");
      this.emit(run, "executor", "blocked", "safety", "工具调用次数已达到上限，停止继续调用。", { toolCallsUsed: run.limits.toolCallsUsed, maxToolCalls: run.limits.maxToolCalls });
      return;
    }
    run.limits.toolCallsUsed += 1;
    this.emit(run, "executor", "running", "tool", message, { tool, attempt: 1, toolCallsUsed: run.limits.toolCallsUsed, maxToolCalls: run.limits.maxToolCalls });
  }

  private executeSideEffect(next: RuntimeSnapshot, run: RunRecord): void {
    const existing = run.sideEffects.find((item) => item.requirementVersion === run.requirement.version);
    if (existing) {
      this.emit(run, "executor", run.status, "safety", "同一需求版本已有副作用记录；跳过重复执行。", { sideEffectId: existing.id });
      return;
    }
    const sideEffect = {
      id: `side-effect-${run.id}-v${run.requirement.version}`,
      action: "persist_draft",
      scope: `${run.projectId}:draft`,
      requirementVersion: run.requirement.version,
      executedAt: new Date().toISOString(),
    };
    run.sideEffects.push(sideEffect);
    this.setAgent(run, "executor", "success", "模拟草稿已持久化；副作用已记录幂等键。");
    this.emit(run, "executor", "running", "tool", "执行模拟写入 persist_draft。", { sideEffectId: sideEffect.id, requirementVersion: sideEffect.requirementVersion, idempotencyKey: sideEffect.scope });
  }

  private review(next: RuntimeSnapshot, run: RunRecord): void {
    this.setAgent(run, "reviewer", "running", "核对需求版本、证据来源、副作用与取消状态。");
    if (run.sideEffects.some((item) => item.requirementVersion !== run.requirement.version)) {
      run.status = "blocked";
      this.emit(run, "reviewer", "blocked", "validation", "发现过期需求版本的副作用记录，已阻止完成。");
      return;
    }
    this.emit(run, "reviewer", "running", "validation", "校验通过：证据带来源版本，副作用绑定当前需求版本。", { evidenceCount: run.evidenceHits.length, sideEffectCount: run.sideEffects.length });
    this.setAgent(run, "reviewer", "success", "复核通过。");
    this.finish(next, run);
  }

  private finish(next: RuntimeSnapshot, run: RunRecord): void {
    if (run.status === "blocked" || run.status === "cancelled") return;
    if (run.status === "waiting_approval" && !run.approval) return;
    run.status = "completed";
    run.completedAt = new Date().toISOString();
    this.emit(run, "reviewer", "completed", "stage", "多 Agent 流程完成。");
  }

  private guardHostileCommand(command: string): void {
    if (/rm -rf|eval\(|exec\(|child_process|secret|token/i.test(command)) throw new Error("命令包含被禁止的敏感或任意执行模式");
  }

  private setAgent(run: RunRecord, role: AgentRole, status: RunRecord["agents"][number]["status"], summary: string): void {
    const agent = run.agents.find((item) => item.role === role);
    if (agent) {
      agent.status = status;
      agent.summary = summary;
    }
  }

  private emit(run: RunRecord, role: RuntimeEvent["role"], status: RunStatus, kind: RuntimeEvent["kind"], message: string, metadata?: RuntimeEvent["metadata"]): void {
    this.guardHostileCommand(message);
    run.events.push({
      id: `${run.id}:event:${run.events.length + 1}`,
      runId: run.id,
      role,
      status,
      kind,
      message,
      createdAt: new Date().toISOString(),
      ...(metadata ? { metadata } : {}),
    });
  }
}

export function createRuntime(projectId?: string): MultiAgentRuntime {
  return new MultiAgentRuntime(projectId);
}

