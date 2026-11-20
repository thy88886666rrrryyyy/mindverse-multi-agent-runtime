# Multi-Agent Runtime Architecture

## English

### Implemented Boundaries

This challenge implements an offline, deterministic multi-agent runtime around four roles:

- **Planner**: validates requirement, reads project-scoped long-term memory and attached canvas-node context, then prepares handoff context.
- **Retriever**: searches local RAG evidence, returns document id/version/source/excerpt, and excludes deleted documents.
- **Executor**: validates local tool arguments, records read-only tool calls, and gates the simulated write side effect behind a scoped approval.
- **Reviewer**: checks the current requirement version, evidence provenance, side-effect binding and final state before completion.

The runtime lives under `src/core/runtime/`:

- `types.ts`: run, agent, memory, evidence, approval and event contracts.
- `store.ts`: validation and seed memory/evidence records.
- `memory.ts`: scoped memory search and RAG retrieval with version/deletion filtering.
- `engine.ts`: command dispatch, state transitions, approval, recovery, cancellation and side-effect idempotency.
- `index.ts`: public package exports.

### Persistence and Recovery

The current demo keeps runtime state in memory for the browser session. The run record is designed to be serialized: it contains requirement versions, agent states, redacted events, memory/evidence references, approval request/response, side effects and recovery count.

A blocked run can be recovered. Side effects are recorded with a requirement version and scope. If the same requirement version already has a recorded side effect, recovery does not execute it again. The run record also tracks tool-call usage against a local cap, retry budget and recovery count.

### Requirement Versioning and Approval

When the requirement changes during execution:

- The requirement version increments.
- The previous approval and approval request are invalidated.
- A side effect cannot be authorized by an old approval.
- A new approval must match the current requirement version and its explicit scope.

### Safety Assumptions

- Retrieved text, imports and tool responses are untrusted data; they do not authorize commands or secrets.
- Tools are local and deterministic; no shell, network, model or paid service is invoked.
- Sensitive patterns such as shell execution, token/secret references or arbitrary evaluation are rejected at input validation.
- Browser data and events avoid private chain-of-thought.
- `.env.example` only documents optional future model adapters; no real credential is required or committed.

### Limitations

- No durable backend, authentication, database or encrypted browser persistence is included.
- Concurrency is represented through role handoffs rather than real parallel workers.
- RAG scoring is a simple offline keyword matcher, not a production embedding retriever.
- Failure injection and recovery are deterministic mocks; they do not represent distributed transaction recovery.
- Real-model integration is intentionally excluded from the offline reproducible path.

## 繁體中文

### 已實作邊界

本挑戰實作離線、確定性的多 Agent 執行系統，包含四個角色：

- **Planner**：驗證需求、讀取專案範圍內長期記憶與附帶畫布節點上下文，並準備交接上下文。
- **Retriever**：檢索本地 RAG 證據，回傳文件 ID、版本、來源與摘要，排除已刪除文件。
- **Executor**：驗證本地工具參數，記錄唯讀工具呼叫，並將模擬寫入副作用放在限定範圍審批之後。
- **Reviewer**：完成前檢查當前需求版本、證據來源、副作用綁定與最終狀態。

執行時間位於 `src/core/runtime/`：

- `types.ts`：運行、Agent、記憶、證據、審批與事件契約。
- `store.ts`：輸入驗證與種子記憶／證據資料。
- `memory.ts`：記憶搜尋與 RAG 檢索，處理版本與刪除過濾。
- `engine.ts`：指令調度、狀態轉移、審批、恢復、取消與副作用冪等。
- `index.ts`：公開匯出。

### 持久化與恢復

目前示範將執行狀態保留在瀏覽器記憶體中。運行記錄按可序列化設計：包含需求版本、Agent 狀態、去識別化事件、記憶／證據引用、審批請求與回應、副作用及恢復次數。

阻塞中的運行可以恢復。副作用以需求版本與範圍記錄；同一需求版本已有副作用記錄時，恢復流程不會重複執行。運行記錄同時追蹤工具呼叫次數、重試預算與恢復次數。

### 需求版本與審批

執行中需求變更時：

- 需求版本遞增。
- 舊審批與舊審批請求作廢。
- 舊審批不能授權變更後的副作用。
- 新審批必須匹配當前需求版本與明確範圍。

### 安全假設

- 檢索文字、匯入資料與工具回應皆為不可信資料，不具命令或機密授權效力。
- 工具為本地確定性模擬；不呼叫 shell、網路、模型或付費服務。
- shell 執行、Token／密鑰或任意評估等敏感模式會在輸入驗證階段拒絕。
- 瀏覽器資料與事件不包含私有思維鏈。
- `.env.example` 只記錄未來可選模型介接；不要求也不提交真實憑證。

### 限制

- 未包含持久後端、身分驗證、資料庫或加密瀏覽器持久化。
- 並行性以角色交接表達，不是真實平行工作者。
- RAG 評分是簡單離線關鍵詞比對，不是生產級嵌入檢索。
- 故障注入與恢復為確定性模擬，不等於分散式交易恢復。
- 真實模型介接刻意排除在離線可復現路徑之外。
