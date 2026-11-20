import type { EvidenceDocument, MemoryRecord, RuntimeSnapshot } from "./types.ts";

const MAX_INSTRUCTION_LENGTH = 2000;

export function validateText(value: unknown, field: string, maxLength = MAX_INSTRUCTION_LENGTH): string {
  if (typeof value !== "string") throw new Error(`${field} 必须是字符串`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} 不能为空`);
  if (trimmed.length > maxLength) throw new Error(`${field} 超过 ${maxLength} 字符上限`);
  return trimmed;
}

export function seedMemory(projectId: string): MemoryRecord[] {
  return [
    {
      id: "mem-identity",
      projectId,
      scope: "project",
      kind: "constraint",
      text: "主体身份在所有输出中必须保持一致。",
      version: 1,
      deleted: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "mem-safe-tools",
      projectId,
      scope: "project",
      kind: "preference",
      text: "优先使用本地只读工具；模拟写入前必须获得限定范围审批。",
      version: 1,
      deleted: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ];
}

export function seedEvidence(projectId: string): EvidenceDocument[] {
  return [
    {
      id: "doc-identity",
      projectId,
      version: 1,
      deleted: false,
      title: "主体一致性说明",
      text: "同一主体需要在简报、参考素材和最终摘要中保持名称、外观特征与位置关系一致。",
      tags: ["identity", "consistency"],
      source: "local-sample",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "doc-camera",
      projectId,
      version: 2,
      deleted: false,
      title: "三机位构图说明",
      text: "三个机位分别覆盖正面、侧面与俯视；侧面机位需要保留主体和背景参考线。",
      tags: ["camera", "composition"],
      source: "local-sample",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "doc-stale",
      projectId,
      version: 1,
      deleted: true,
      title: "已废弃的旧版配色",
      text: "旧版本曾建议使用暖黄色背景；该约束已被删除，检索时不得引用。",
      tags: ["deprecated"],
      source: "local-sample",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];
}

export function createInitialSnapshot(projectId: string): RuntimeSnapshot {
  return {
    runs: [],
    memories: seedMemory(projectId),
    evidence: seedEvidence(projectId),
  };
}

export function cloneSnapshot(snapshot: RuntimeSnapshot): RuntimeSnapshot {
  return structuredClone(snapshot);
}
