import type { EvidenceDocument, EvidenceHit, MemoryRecord } from "./types.ts";

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9\u4e00-\u9fff]+/).filter(Boolean);
}

export function searchMemory(memories: MemoryRecord[], projectId: string, query: string): MemoryRecord[] {
  const terms = new Set(tokenize(query));
  const matched = memories
    .filter((record) => record.projectId === projectId && !record.deleted)
    .map((record) => {
      const recordTerms = new Set([...tokenize(record.text), ...tokenize(record.kind), ...tokenize(record.scope)]);
      const score = [...terms].filter((term) => recordTerms.has(term)).length;
      return { record, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.record.id.localeCompare(b.record.id));
  if (matched.length > 0) return matched.map((item) => item.record);
  return memories.filter((record) => record.projectId === projectId && !record.deleted).slice(0, 2);
}

export function retrieveEvidence(evidence: EvidenceDocument[], projectId: string, query: string): EvidenceHit[] {
  const terms = new Set(tokenize(query));
  const scored = evidence
    .filter((doc) => doc.projectId === projectId && !doc.deleted)
    .map((doc) => {
      const corpus = [doc.title, doc.text, ...doc.tags].join(" ");
      const corpusTerms = new Set(tokenize(corpus));
      const score = [...terms].filter((term) => corpusTerms.has(term)).length;
      return { doc, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.doc.id.localeCompare(b.doc.id));
  const hits = scored.map(({ doc, score }) => ({
    documentId: doc.id,
    version: doc.version,
    title: doc.title,
    excerpt: doc.text,
    score,
    source: doc.source,
  }));
  if (hits.length > 0) return hits;
  return evidence
    .filter((doc) => doc.projectId === projectId && !doc.deleted)
    .slice(0, 2)
    .map((doc) => ({
      documentId: doc.id,
      version: doc.version,
      title: doc.title,
      excerpt: doc.text,
      score: 0,
      source: doc.source,
    }));
}

export function reviseMemory(memories: MemoryRecord[], memoryId: string, text: string, projectId: string, now: string): MemoryRecord[] {
  return memories.map((record) => {
    if (record.id !== memoryId || record.projectId !== projectId) return record;
    if (record.deleted) return record;
    return { ...record, text: text.trim(), version: record.version + 1, updatedAt: now };
  });
}

export function deleteMemory(memories: MemoryRecord[], memoryId: string, projectId: string): MemoryRecord[] {
  return memories.map((record) => record.id === memoryId && record.projectId === projectId ? { ...record, deleted: true, updatedAt: new Date().toISOString() } : record);
}
