# Reliable Multi-Agent Runtime

## English

Offline deterministic implementation of challenge 01: a multi-agent runtime covering long-term memory, RAG evidence retrieval, mid-execution requirement changes, scoped approval, cancellation, blocked recovery and duplicate side-effect prevention.

### Requirements

- Node.js 22.18+
- npm

### Setup

```sh
npm install
npm run dev
```

Open http://localhost:3061.

### Verification

```sh
npm run typecheck
npm test
npm run build
```

Current verification: 11 tests pass; TypeScript strict check passes; production build passes.

### Core Flow

1. **Planner** validates the instruction and loads project-scoped long-term memory.
2. **Retriever** returns RAG evidence with document id, version, source and excerpt; deleted or stale documents are excluded.
3. **Executor** runs local deterministic read-only tools. A simulated write side effect requires explicit, scoped approval tied to the current requirement version.
4. **Reviewer** checks version binding, evidence provenance and side-effect records before marking the run completed.

### Demo Walkthrough

1. Run `npm install` and `npm run dev`, then open http://localhost:3061.
2. Keep the default instruction and start a run. Watch Planner read the canvas nodes and long-term memory, Retriever return versioned evidence, Executor request scoped approval, and Reviewer complete the check.
3. Open a historical run from the right-side history list to inspect its events, evidence, approval and side-effect record.
4. Toggle `模拟工具失败`, start another run, observe the blocked state, then use **恢复运行**; the recovered run must not repeat the side effect for the same requirement version.
5. Update the requirement during execution. The old approval and approval request are invalidated; a new approval must match the current requirement version.
6. Approve or reject the pending simulated side effect, or cancel the run. Cancellation does not register a new side effect.

### Visible Reliability Boundaries

- Maximum retry: 1.
- Maximum local tool calls: 6 per run.
- Tool calls and recovery count are shown in the run record.
- Side effects are recorded with action, scope and requirement version.
- Approval evidence includes the action, scope and requirement version being authorized.

### Project Structure

- `src/core/canvas.ts`: starter canvas snapshot parsing and compatibility exports.
- `src/core/mockAgent.ts`: retained starter single-agent mock and legacy tests.
- `src/core/runtime/`: implemented multi-agent runtime.
- `src/app/page.tsx`: local demo UI showing roles, events, evidence, approvals and controls.
- `tests/`: snapshot, legacy mock and runtime reliability tests.

### Design Decisions

- **Local deterministic tools**: avoid model/network dependence so the assessment can be reproduced offline.
- **Memory separate from RAG**: long-term memory stores revisable project preferences/constraints/decisions; RAG stores versioned evidence documents.
- **Requirement version binding**: approvals and side effects are bound to a requirement version to prevent stale authorization.
- **Idempotent side-effect records**: recovery does not repeat a side effect already recorded for the current requirement version.
- **Redacted events**: logs show role, summary, tool name and provenance, not private reasoning.

### Limitations

- Runtime state is in-memory for this demo; refreshing the browser loses active run records. No backend database or authentication is included.
- RAG retrieval is a keyword matcher, not an embedding vector search. When no keyword matches, the demo falls back to local sample evidence only for demonstration; a production retriever should return an empty result and report insufficient evidence.
- The sensitive-pattern filter is a demo-level input safeguard, not a complete command-injection defense. Production use requires tool allowlists, parameter schema validation, server-side isolation and audit logging.
- Real model adapters are optional and must keep credentials server-side; this submission does not call any paid service.
- No arbitrary code/shell execution, secret commit, user data upload or production deployment is included.

### AI and Third-Party Tools

- Framework: Next.js 15, React 19, React Flow, TypeScript, Node test runner.
- Development assistance: Doubao AI was used to scaffold, debug and document the implementation. No external data, paid API or generated media was used.

## 繁體中文

離線確定性實作題目一：多 Agent 執行系統，覆蓋長期記憶、RAG 證據檢索、執行中需求變更、限定範圍審批、取消、阻塞恢復與重複副作用預防。

### 環境

- Node.js 22.18+
- npm

### 啟動

```sh
npm install
npm run dev
```

開啟 http://localhost:3061。

### 驗證

```sh
npm run typecheck
npm test
npm run build
```

目前驗證結果：11 個測試通過；TypeScript 嚴格檢查通過；生產構建通過。

### 核心流程

1. **Planner** 驗證指令並載入專案長期記憶。
2. **Retriever** 回傳帶文件 ID、版本、來源與摘要的 RAG 證據，排除已刪除或過期文件。
3. **Executor** 執行本地確定性唯讀工具；模擬寫入副作用需要綁定當前需求版本的明確範圍審批。
4. **Reviewer** 完成前檢查版本綁定、證據來源與副作用記錄。

### 示範路徑

1. 執行 `npm install` 與 `npm run dev`，開啟 http://localhost:3061。
2. 使用預設指令啟動運行：Planner 讀取畫布節點與長期記憶，Retriever 回傳帶版本的證據，Executor 請求限定範圍審批，Reviewer 完成複核。
3. 在右側歷史列表切換運行記錄，查看事件、證據、審批與副作用。
4. 開啟「模擬工具失敗」後重新運行，觀察阻塞狀態；點「恢復運行」後，同一需求版本不得重複副作用。
5. 執行中更新需求；舊審批與舊審批請求作廢，新審批必須匹配當前需求版本。
6. 批准或拒絕待確認的模擬副作用，或取消運行；取消不會登記新副作用。

### 可靠性邊界

- 最大重試：1 次。
- 每次運行最多本地工具呼叫：6 次。
- 運行記錄展示工具呼叫次數與恢復次數。
- 副作用記錄包含動作、範圍與需求版本。
- 審批摘要展示被授權的動作、範圍與需求版本。

### 設計取捨

- 使用本地確定性工具，避免模型與網路依賴，保證離線復現。
- 長期記憶與 RAG 分離：記憶可修訂，證據文件帶版本與來源。
- 審批與副作用綁定需求版本，避免舊授權覆蓋變更後工作。
- 恢復時檢查已有副作用記錄，避免重複執行。
- 事件只保留角色、摘要、工具名稱與來源，不暴露私有思維鏈。

### 限制

- 目前運行狀態在記憶體中；重新整理瀏覽器會丟失活動運行記錄，未包含後端資料庫或身分驗證。
- RAG 為關鍵詞比對，不是嵌入向量檢索；無關鍵詞命中時，本 demo 僅回退展示本地樣例證據，生產檢索應回傳空結果並提示證據不足。
- 敏感模式過濾是示範級輸入防護，不是完整命令注入防線；生產環境需要工具白名單、參數 Schema 校驗、伺服器隔離與稽核日誌。
- 真實模型介接為可選項，憑證必須留在伺服器端；本提交不呼叫付費服務。
- 未包含任意程式／Shell 執行、密鑰提交、使用者資料上傳或正式部署。
