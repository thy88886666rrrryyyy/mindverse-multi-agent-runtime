export type AgentRole = "planner" | "retriever" | "executor" | "reviewer";
export type RunStatus = "queued" | "running" | "waiting_approval" | "waiting_input" | "completed" | "blocked" | "cancelled";
export type EventKind = "stage" | "tool" | "evidence" | "approval" | "safety" | "validation" | "error" | "memory";

export type RequirementVersion = {
  version: number;
  text: string;
  updatedAt: string;
};

export type MemoryRecord = {
  id: string;
  projectId: string;
  scope: "project" | "global";
  kind: "preference" | "constraint" | "decision";
  text: string;
  version: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EvidenceDocument = {
  id: string;
  projectId: string;
  version: number;
  deleted: boolean;
  title: string;
  text: string;
  tags: string[];
  source: "local-sample" | "user-import";
  createdAt: string;
};

export type EvidenceHit = {
  documentId: string;
  version: number;
  title: string;
  excerpt: string;
  score: number;
  source: EvidenceDocument["source"];
};

export type ApprovalRequest = {
  id: string;
  action: string;
  scope: string;
  requirementVersion: number;
  createdAt: string;
};

export type Approval = {
  requestId: string;
  approved: boolean;
  approvedAt: string;
  requirementVersion: number;
  note?: string;
};

export type SideEffect = {
  id: string;
  action: string;
  scope: string;
  requirementVersion: number;
  executedAt: string;
};

export type CanvasContextItem = {
  id: string;
  title: string;
  nodeType: string;
  excerpt: string;
};

export type RuntimeLimits = {
  maxRetries: number;
  maxToolCalls: number;
  toolCallsUsed: number;
  recoveryCount: number;
};

export type RuntimeEvent = {
  id: string;
  runId: string;
  role: AgentRole | "system";
  status: RunStatus;
  kind: EventKind;
  message: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null | string[]>;
};

export type AgentState = {
  role: AgentRole;
  status: "idle" | "running" | "waiting" | "success" | "error";
  summary: string;
};

export type RunRecord = {
  id: string;
  projectId: string;
  status: RunStatus;
  requirement: RequirementVersion;
  agents: AgentState[];
  events: RuntimeEvent[];
  memory: MemoryRecord[];
  evidence: EvidenceDocument[];
  evidenceHits: EvidenceHit[];
  approvalRequest?: ApprovalRequest;
  approval?: Approval;
  sideEffects: SideEffect[];
  canvasContext: CanvasContextItem[];
  limits: RuntimeLimits;
  completedAt?: string;
  failureInjected?: boolean;
  cancelledAt?: string;
  recoveryCount: number;
};

export type RuntimeOptions = {
  simulateFailure?: boolean;
  requireApproval?: boolean;
  now?: string;
};

export type RuntimeSnapshot = {
  runs: RunRecord[];
  memories: MemoryRecord[];
  evidence: EvidenceDocument[];
};

export type RuntimeCommand =
  | { type: "start"; runId: string; projectId: string; instruction: string; canvasContext?: CanvasContextItem[]; options?: RuntimeOptions }
  | { type: "update_requirement"; runId: string; text: string }
  | { type: "approve"; runId: string; approved: boolean; note?: string }
  | { type: "cancel"; runId: string }
  | { type: "recover"; runId: string };
