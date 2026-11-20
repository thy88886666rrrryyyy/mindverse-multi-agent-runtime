"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addEdge, Background, BackgroundVariant, Controls, Handle, Position,
  ReactFlow, useEdgesState, useNodesState, useReactFlow,
  type Connection, type NodeProps, type Node, type Edge,
} from "@xyflow/react";
import {
  ArrowDownToLine, ArrowUpFromLine, Bot, Check, ChevronRight, CircleAlert,
  FileText, FolderOpen, ImageIcon, Layers3, LoaderCircle, Moon, Plus,
  Save, Send, Sun, Trash2, Video, X,
} from "lucide-react";
import { initialSnapshot, parseSnapshot, type CanvasNode, type CanvasSnapshot } from "../core/canvas.ts";
import { createRuntime, type RunRecord, type RuntimeSnapshot } from "../core/runtime/index.ts";

type EditorNode = Node<CanvasNode["data"], "creative">;
type EditorEdge = Edge;
type EventFilter = "all" | "memory" | "evidence" | "tool" | "approval" | "error";

const storageKey = "mindverse-challenge:canvas:v1";
const themeKey = "mindverse-challenge:theme";
const nodeLabels = { text: "文本", image: "图像", video: "视频", reference: "参考" };
const statusLabels = { idle: "未执行", running: "运行中", waiting: "等待中", success: "已完成", error: "失败" };
const runStatusLabels: Record<RunRecord["status"], string> = {
  queued: "排队",
  running: "运行中",
  waiting_approval: "等待审批",
  waiting_input: "等待输入",
  completed: "已完成",
  blocked: "阻塞",
  cancelled: "已取消",
};
const roleLabels: Record<string, string> = {
  system: "系统",
  planner: "规划",
  retriever: "检索",
  executor: "执行",
  reviewer: "复核",
};
const sourceLabels: Record<string, string> = {
  "local-sample": "本地样例",
  "user-import": "用户导入",
};
const filterLabels: Record<EventFilter, string> = {
  all: "全部",
  memory: "记忆",
  evidence: "证据",
  tool: "工具",
  approval: "审批",
  error: "错误",
};
const starter = structuredClone(initialSnapshot);
starter.projectName = "未命名创意项目";
starter.nodes[0].data = { ...starter.nodes[0].data, title: "创意简报", textContent: "安静的摄影棚，同一主体，三个机位。保持场景与主体一致。" };
starter.nodes[1].data = { ...starter.nodes[1].data, title: "场景参考", textContent: "白模构图参考，保留空间关系与主体位置。", imageUrl: "/samples/reference.png" };

function CreativeNode({ id, data, selected }: NodeProps<EditorNode>) {
  const { setNodes } = useReactFlow<EditorNode, EditorEdge>();
  const [imageFailed, setImageFailed] = useState(false);
  const update = (patch: Partial<CanvasNode["data"]>) => setNodes((nodes) => nodes.map((node) => node.id === id ? { ...node, data: { ...node.data, ...patch } } : node));
  const Icon = data.nodeType === "text" ? FileText : data.nodeType === "video" ? Video : ImageIcon;
  useEffect(() => setImageFailed(false), [data.imageUrl]);
  return (
    <article className={`creative-node ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <header className="node-heading"><Icon size={15} /><input className="nodrag node-title" aria-label="节点标题" value={data.title} maxLength={120} onChange={(event) => update({ title: event.target.value })} /><span className={`node-status ${data.status}`}>{statusLabels[data.status]}</span></header>
      {data.nodeType !== "text" && <div className="node-media">
        {data.imageUrl && !imageFailed ? <img src={data.imageUrl} alt={data.title} draggable={false} onError={() => setImageFailed(true)} /> : <div className="media-empty"><Icon size={28} strokeWidth={1} /><span>暂无预览</span></div>}
      </div>}
      <textarea className="nodrag nowheel node-text" aria-label="节点内容" value={data.textContent} onChange={(event) => update({ textContent: event.target.value })} />
      <footer className="node-footer"><select className="nodrag" aria-label="节点类型" value={data.nodeType} onChange={(event) => update({ nodeType: event.target.value as CanvasNode["data"]["nodeType"] })}>{Object.entries(nodeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><span>{id.slice(0, 12)}</span></footer>
      <Handle type="source" position={Position.Right} />
    </article>
  );
}

const nodeTypes = { creative: CreativeNode };

function canvasContextFromSnapshot(nodes: EditorNode[]) {
  return nodes.map((node) => ({
    id: node.id,
    title: node.data.title,
    nodeType: node.data.nodeType,
    excerpt: node.data.textContent,
  }));
}

export default function CanvasPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<EditorNode>(starter.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EditorEdge>(starter.edges);
  const [projectName, setProjectName] = useState(starter.projectName);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notice, setNotice] = useState("本地草稿");
  const [instruction, setInstruction] = useState("保持主体身份一致，并整理三个机位的构图说明。");
  const [requirementDraft, setRequirementDraft] = useState("");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [runtimeSnapshot, setRuntimeSnapshot] = useState<RuntimeSnapshot>(() => createRuntime("mindverse-demo").getSnapshot());
  const [selectedRunId, setSelectedRunId] = useState("");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const fileInput = useRef<HTMLInputElement>(null);

  const runtime = useMemo(() => createRuntime("mindverse-demo"), []);
  const currentRun = runtimeSnapshot.runs.find((run) => run.id === selectedRunId) ?? runtimeSnapshot.runs[0];
  const activeRun = runtimeSnapshot.runs[0];
  const busy = activeRun?.status === "running" || activeRun?.status === "waiting_approval";
  const readOnly = !!currentRun && !!activeRun && currentRun.id !== activeRun.id;
  const activeEditable = !!activeRun && !["completed", "cancelled", "blocked"].includes(activeRun.status);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(themeKey);
      const next = saved === "dark" ? "dark" : "light";
      setTheme(next);
      document.documentElement.dataset.theme = next;
    } catch { setNotice("浏览器存储不可用，仍可导出 JSON"); }
  }, []);

  const snapshot = (): CanvasSnapshot => parseSnapshot({ version: 1, projectName, nodes, edges });
  const restore = (value: unknown) => {
    const restored = parseSnapshot(value);
    setNodes(restored.nodes);
    setEdges(restored.edges);
    setProjectName(restored.projectName);
  };
  const act = (operation: () => void) => {
    try { operation(); } catch (error) { setNotice(error instanceof Error ? error.message : "操作失败：文件结构无效或本地存储不可用"); }
  };
  const connect = (connection: Connection) => {
    if (!connection.source || !connection.target || connection.source === connection.target) return;
    setEdges((current) => addEdge({ ...connection, id: crypto.randomUUID() }, current));
  };
  const addNode = () => setNodes((current) => [...current, {
    id: crypto.randomUUID(), type: "creative", position: { x: 100 + (current.length % 4) * 65, y: 120 + (current.length % 5) * 85 },
    data: { nodeType: "text", title: "新建文本", textContent: "", status: "idle" },
  }]);
  const deleteSelected = () => {
    const deleted = new Set(nodes.filter((node) => node.selected).map((node) => node.id));
    setNodes((current) => current.filter((node) => !deleted.has(node.id)));
    setEdges((current) => current.filter((edge) => !edge.selected && !deleted.has(edge.source) && !deleted.has(edge.target)));
  };
  const save = () => act(() => { localStorage.setItem(storageKey, JSON.stringify(snapshot())); setNotice("已保存到此浏览器"); });
  const load = () => act(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) { setNotice("此浏览器暂无存档"); return; }
    restore(JSON.parse(saved)); setNotice("已载入本地存档");
  });
  const exportJson = () => act(() => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot(), null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "mindverse-canvas.json"; anchor.click();
    URL.revokeObjectURL(url); setNotice("已导出画布 JSON");
  });
  const importJson = async (file?: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setNotice("导入失败：文件不能超过 2 MB"); return; }
    try { restore(JSON.parse(await file.text())); setNotice("已导入并校验画布"); }
    catch { setNotice("导入失败：请检查 JSON、节点与连线结构"); }
  };
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next); document.documentElement.dataset.theme = next;
    act(() => localStorage.setItem(themeKey, next));
  };

  const startRun = () => act(() => {
    const nextRunId = `run-${Date.now()}`;
    const next = runtime.run({
      type: "start",
      runId: nextRunId,
      projectId: "mindverse-demo",
      instruction,
      canvasContext: canvasContextFromSnapshot(nodes),
      options: { simulateFailure },
    });
    setRuntimeSnapshot(next);
    setSelectedRunId(nextRunId);
    setRequirementDraft("");
    setEventFilter("all");
    const started = next.runs[0];
    setNotice(started?.status === "blocked" ? "运行已创建，但工具故障已注入；可恢复后继续演示。" : "运行已创建；核心流程由本地确定性 Agent 执行。");
  });

  const updateRequirement = () => act(() => {
    if (!activeRun || !requirementDraft.trim()) return;
    setRuntimeSnapshot(runtime.run({ type: "update_requirement", runId: activeRun.id, text: requirementDraft }));
    setNotice("需求版本已更新；旧审批已作废，需重新确认副作用范围。");
  });

  const approve = (approved: boolean) => act(() => {
    if (!activeRun) return;
    setRuntimeSnapshot(runtime.run({ type: "approve", runId: activeRun.id, approved }));
    setNotice(approved ? "已按限定范围批准模拟副作用。" : "审批被拒绝，运行已阻塞。");
  });

  const cancelRun = () => act(() => {
    if (!activeRun) return;
    setRuntimeSnapshot(runtime.run({ type: "cancel", runId: activeRun.id }));
    setNotice("运行已取消；未登记新的模拟副作用。");
  });

  const recover = () => act(() => {
    if (!activeRun) return;
    setRuntimeSnapshot(runtime.run({ type: "recover", runId: activeRun.id }));
    setNotice("已从阻塞或待重新确认状态恢复。");
  });

  const filteredEvents = currentRun?.events.filter((event) => {
    if (eventFilter === "all") return true;
    if (eventFilter === "error") return event.kind === "error" || event.status === "blocked";
    return event.kind === eventFilter;
  }) ?? [];

  const evidenceSummary = currentRun?.evidenceHits.length
    ? currentRun.evidenceHits.map((hit) => `${hit.title} v${hit.version}`).join("；")
    : "未检索到可引用证据。";
  const outputSummary = currentRun ? [
    `需求 v${currentRun.requirement.version}：${currentRun.requirement.text}`,
    `长期记忆：${currentRun.memory.length} 条；RAG 证据：${currentRun.evidenceHits.length} 条；副作用：${currentRun.sideEffects.length} 个。`,
    `工具调用：${currentRun.limits.toolCallsUsed}/${currentRun.limits.maxToolCalls}；恢复次数：${currentRun.limits.recoveryCount}；最大重试：${currentRun.limits.maxRetries}。`,
    evidenceSummary,
  ].join("\n") : "暂无运行记录。";

  const canEditActive = activeEditable;

  return (
    <main className="workspace">
      <header className="topbar">
        <div className="brand"><Layers3 size={22} strokeWidth={1.6} /><strong>Mindverse</strong></div>
        <ChevronRight className="breadcrumb" size={14} />
        <input className="project-name" aria-label="项目名称" value={projectName} maxLength={100} onChange={(event) => setProjectName(event.target.value)} />
        <span className="challenge-tag">多 Agent 运行时 / 01</span>
        <div className="top-actions">
          <button className="icon-button" title="保存到浏览器" aria-label="保存到浏览器" onClick={save}><Save size={17} /></button>
          <button className="icon-button" title="载入本地存档" aria-label="载入本地存档" onClick={load}><FolderOpen size={17} /></button>
          <span className="divider" />
          <button className="icon-button" title="导出 JSON" aria-label="导出 JSON" onClick={exportJson}><ArrowDownToLine size={17} /></button>
          <button className="icon-button" title="导入 JSON" aria-label="导入 JSON" onClick={() => fileInput.current?.click()}><ArrowUpFromLine size={17} /></button>
          <button className="icon-button" title={theme === "light" ? "切换深色主题" : "切换浅色主题"} aria-label={theme === "light" ? "切换深色主题" : "切换浅色主题"} onClick={toggleTheme}>{theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</button>
        </div>
        <input ref={fileInput} hidden type="file" accept=".json,application/json" onChange={(event) => { void importJson(event.target.files?.[0]); event.target.value = ""; }} />
      </header>

      <div className="workspace-body">
        <section className="canvas-area" aria-label="创意画布">
          <div className="canvas-toolbar"><button className="primary-button" onClick={addNode}><Plus size={16} />添加节点</button><button className="icon-button" title="删除选中节点或连线" aria-label="删除选中节点或连线" disabled={!nodes.some((node) => node.selected) && !edges.some((edge) => edge.selected)} onClick={deleteSelected}><Trash2 size={16} /></button></div>
          <ReactFlow<EditorNode, EditorEdge> nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={connect} isValidConnection={(connection) => connection.source !== connection.target} fitView fitViewOptions={{ padding: 0.18, maxZoom: 1 }} minZoom={0.2} maxZoom={2} colorMode={theme} deleteKeyCode={["Backspace", "Delete"]} defaultEdgeOptions={{ type: "smoothstep" }}>
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
          <div className="canvas-status"><span>{nodes.length} 个节点 · {edges.length} 条连接</span><span role="status">{notice}</span></div>
        </section>

        <aside className="agent-panel" aria-label="Agent 任务面板">
          <header className="panel-heading"><Bot size={19} /><h1>多 Agent 运行时</h1><span className="mode-badge">本地离线模拟</span></header>
          <div className="agent-scroll">
            <div className="session-heading"><span className="tiny-dot" />规划 · 检索 · 执行 · 复核</div>
            <h2>可靠协作演示</h2>
            <div className="runtime-facts"><span>模型 <b>未连接</b></span><span>工具 <b>本地确定性</b></span></div>

            {runtimeSnapshot.runs.length > 1 && (
              <div className="run-history" aria-label="运行历史">
                {runtimeSnapshot.runs.map((run) => (
                  <button key={run.id} className={`history-item ${run.id === currentRun?.id ? "selected" : ""}`} onClick={() => setSelectedRunId(run.id)}>
                    <span>{run.id.slice(-8)}</span>
                    <small>{runStatusLabels[run.status]}</small>
                  </button>
                ))}
              </div>
            )}

            {!currentRun && <div className="empty-run"><Layers3 size={32} strokeWidth={1} /><span>暂无运行记录</span><small>输入任务后启动；可观察记忆、证据、审批与复核流程。</small></div>}
            {busy && <div className="running-state" role="status"><LoaderCircle size={18} className="spinning" />正在调度本地 Agent 流程…</div>}
            {readOnly && <div className="readonly-note">正在查看历史运行；当前操作仅作用于最新运行。</div>}

            {currentRun && <section className="run-record" aria-label="运行记录">
              <div className="run-summary"><span>{currentRun.id}</span><strong className={currentRun.status === "blocked" || currentRun.status === "cancelled" ? "error-text" : ""}>{runStatusLabels[currentRun.status]}</strong></div>
              <div className="agent-grid">
                {currentRun.agents.map((agent) => <div key={agent.role} className="agent-chip"><span>{roleLabels[agent.role]}</span><small>{statusLabels[agent.status]}</small></div>)}
              </div>

              <div className="limits-row">
                <span>工具 {currentRun.limits.toolCallsUsed}/{currentRun.limits.maxToolCalls}</span>
                <span>重试上限 {currentRun.limits.maxRetries}</span>
                <span>恢复 {currentRun.limits.recoveryCount} 次</span>
              </div>

              <div className="filter-row" aria-label="事件筛选">
                {(Object.keys(filterLabels) as EventFilter[]).map((filter) => (
                  <button key={filter} className={`filter-chip ${eventFilter === filter ? "active" : ""}`} onClick={() => setEventFilter(filter)}>{filterLabels[filter]}</button>
                ))}
              </div>

              <ol className="event-list">{filteredEvents.map((event) => <li key={event.id}>
                <span className={`event-icon ${event.kind === "error" ? "error-text" : ""}`}>{event.kind === "error" ? <CircleAlert size={14} /> : <Check size={14} />}</span>
                <div><span className="event-phase">{roleLabels[event.role]}</span><p>{event.message}</p>{event.metadata?.tool && <code>{String(event.metadata.tool)}</code>}</div>
              </li>)}</ol>

              <div className="evidence-list">
              <div className="section-title">RAG 证据</div>
              {currentRun.evidenceHits.length > 0 ? currentRun.evidenceHits.map((hit) => <div key={hit.documentId} className="evidence-card">
                <div><strong>{hit.title}</strong><span>v{hit.version}</span></div>
                <p>{hit.excerpt}</p>
                <small>{sourceLabels[hit.source] ?? hit.source} · 命中分 {hit.score}</small>
              </div>) : <div className="evidence-empty">当前版本未检索到可引用证据。</div>}
            </div>

              <div className="agent-output"><div><FileText size={14} />运行结果</div><p>{outputSummary}</p></div>
            </section>}
          </div>

          <div className="side-panel-controls">
            {currentRun && ["blocked", "waiting_approval"].includes(currentRun.status) && !readOnly && <div className="approval-box">
              <strong>{currentRun.status === "waiting_approval" ? "等待限定范围审批" : "需要恢复后重新确认"}</strong>
              <p>动作：{currentRun.approvalRequest?.action ?? "待重新生成"}</p>
              <p>范围：{currentRun.approvalRequest?.scope ?? "待重新生成"}</p>
              <p>绑定需求：v{currentRun.requirement.version}</p>
              <div className="button-row">
                {currentRun.status === "waiting_approval" && <button className="primary-button" onClick={() => approve(true)}>批准</button>}
                {currentRun.status === "waiting_approval" && <button className="secondary-button" onClick={() => approve(false)}>拒绝</button>}
                {currentRun.status === "blocked" && <button className="primary-button" onClick={recover}>恢复运行</button>}
              </div>
            </div>}
            {canEditActive && (
              <div className="requirement-box">
                <textarea aria-label="中途更新需求" placeholder="执行中修改需求；旧审批会作废" value={requirementDraft} onChange={(event) => setRequirementDraft(event.target.value)} />
                <div className="button-row"><button className="secondary-button" disabled={!requirementDraft.trim()} onClick={updateRequirement}>更新需求</button><button className="secondary-button" disabled={!activeEditable} onClick={cancelRun}>取消运行</button></div>
              </div>
            )}
          </div>
          <form className="agent-composer" onSubmit={(event) => { event.preventDefault(); startRun(); }}>
            <label className="failure-toggle"><input type="checkbox" checked={simulateFailure} disabled={busy} onChange={(event) => setSimulateFailure(event.target.checked)} />模拟工具失败</label>
            <div className="composer-field"><textarea aria-label="任务指令" placeholder="输入任务…" value={instruction} maxLength={2000} disabled={busy} onChange={(event) => setInstruction(event.target.value)} /><div className="composer-footer"><span>{instruction.length} / 2000</span>{busy ? <button className="send-button" type="button" title="取消运行" aria-label="取消运行" onClick={cancelRun}><X size={16} /></button> : <button className="send-button" type="submit" title="启动多 Agent 运行" aria-label="启动多 Agent 运行" disabled={!instruction.trim()}><Send size={16} /></button>}</div></div>
          </form>
        </aside>
      </div>
    </main>
  );
}
