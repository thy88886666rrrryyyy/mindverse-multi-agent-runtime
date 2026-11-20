# Dark Theme UI Guidelines

Adapted from Mindverse design guidelines; condensed, not a verbatim reproduction. Applies to dashboards, settings modals, drawers, and workflow cards.

## Color Tokens
Use neutral surface layers and fine borders for hierarchy; avoid decorative accents and heavy shadows. Slash-separated values are contextual alternatives.
| Token | Value | Use |
| --- | --- | --- |
| `Surface-Backdrop` | `rgba(0, 0, 0, 0.75)` | Modal overlay with medium backdrop blur |
| `Surface-Base` | `#000000` / `#121212` | Page and canvas |
| `Surface-Modal` | `#2d2d2d` | Modal shell and main content |
| `Surface-Sidebar` | `#242424` | Navigation and secondary panels |
| `Surface-Control` | `#1f1f1f` | Inputs, textareas, selects |
| `Surface-Active` | `#383838` | Selected navigation and tiles |
| `Surface-Hover` | `rgba(255, 255, 255, 0.05)` | Unselected item hover |
| `Border-Subtle` | `#6b6b6b` / `rgba(107, 107, 107, 0.4)`; `0.5px` | Outer shell and main dividers |
| `Border-Control` | `#555555`; `0.5px` / `1px` | Controls and secondary cards |
| `Border-Focus` | `#8b8b8b`; `1px` | Focus ring and selected border |
| `Divider-Muted` | `rgba(107, 107, 107, 0.3)`; `1px` | Section and footer separators |
| `Text-Primary` | `#FFFFFF`; level `100%` | Titles, active labels, values |
| `Text-Regular` | `#DEDEDE` / `#C7C7CC`; level `85%` | Labels and body copy |
| `Text-Muted` | `#8E8E93` / `#A8A8A8`; level `60%` | Section headings and metadata |
| `Text-Placeholder` | `#777777`; level `45%` | Placeholders and disabled hints |
| `Control-Primary` | `#FFFFFF`; text `#111827` / `#000000` | Primary action |
| `Control-Primary-Hover` | `#E5E7EB` / `#D1D5DB`; text `#111827` / `#000000` | Primary hover |
| `Control-Secondary` | `#242424`; text `#DEDEDE` | Outline action |
| `Toggle-Active` / `Toggle-Inactive` | `#FFFFFF` / `#48484a` | On / off tracks; thumb black / white |
| `Semantic-Danger` | `#f87171`; paired text `#FFFFFF` | Required marks, sign out, deletion |
| `Semantic-Success` | `#3bf657`; paired text `#18181b` | Success alerts and node status |

## Typography and Geometry
Inherit `--font-inter`: `"Inter 18pt", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`, with font smoothing. Default weight is `500`; structural emphasis uses `600`. Text levels above retain the source hierarchy, not a blanket opacity requirement.
| Element | Size / line height / weight, or radius |
| --- | --- |
| Modal title | `18px` / `24px` / `600` |
| Section heading | `10px` / `14px` / `600` |
| Navigation item | `13px` / `18px` / `500` |
| Form label | `12px` / `16px` / `500` |
| Input and select text | `14px` / `20px` / `500` |
| Action button | `14px` / `20px` / `600` |
| Metadata and small text | `11px`-`12px` / `16px` / `500` |
| Modal shell and primary node | `20px` radius |
| Inner card | `14px` radius |
| Control and navigation item | `10px` radius |
| Secondary button | `8px` radius |
| Primary button, toggle, avatar | `9999px` radius |

## Layout and Interaction
- Keep geometry consistent across themes. Nested container radii must not exceed outer radii; retain the designated pill and circular controls.
- Use spacing steps `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`. The reference modal is `1040px` by `720px`, capped at `96vw` by `92vh`.
- Distinguish default, hover, selected, focused, and disabled states. Inputs use `Border-Focus` with a `1px` focus ring; keep keyboard focus visible and labels legible against their surfaces.
- Preserve switch semantics with `role="switch"` and `aria-checked`. Do not substitute placeholder text for a field label.
- Use `200ms` modal fade/scale and toggle color/position transitions; toggles use ease-in-out. Primary pressed scale is `0.95`; avoid motion that shifts layout.
- Icons use a `24x24` viewBox, `currentColor`, `1.75` stroke, and round caps/joins; close and sign-out examples use `2`. Typical display sizes are `16px`, `17px`, and `20px`.

---

# 暗色主題介面指引

本指引依據 Mindverse 設計規範改編及精簡，並非逐字轉載。適用於儀表板、設定對話框、抽屜面板及工作流程卡片。

## 色彩權杖
以中性背景層次及細邊框建立層級，避免裝飾性強調色及厚重陰影。斜線分隔的數值為依情境選用的替代值。
| 權杖 | 數值 | 用途 |
| --- | --- | --- |
| `Surface-Backdrop` | `rgba(0, 0, 0, 0.75)` | 對話框遮罩，搭配中度背景模糊 |
| `Surface-Base` | `#000000` / `#121212` | 頁面及畫布 |
| `Surface-Modal` | `#2d2d2d` | 對話框外殼及主要內容 |
| `Surface-Sidebar` | `#242424` | 導覽及次級面板 |
| `Surface-Control` | `#1f1f1f` | 輸入框、文字區域及選單 |
| `Surface-Active` | `#383838` | 已選取的導覽項目及區塊 |
| `Surface-Hover` | `rgba(255, 255, 255, 0.05)` | 未選取項目的懸停背景 |
| `Border-Subtle` | `#6b6b6b` / `rgba(107, 107, 107, 0.4)`; `0.5px` | 外殼及主要分隔線 |
| `Border-Control` | `#555555`; `0.5px` / `1px` | 控制項及次級卡片 |
| `Border-Focus` | `#8b8b8b`; `1px` | 焦點外框及選取邊框 |
| `Divider-Muted` | `rgba(107, 107, 107, 0.3)`; `1px` | 區段及頁尾分隔線 |
| `Text-Primary` | `#FFFFFF`; 層級 `100%` | 標題、作用中標籤及輸入值 |
| `Text-Regular` | `#DEDEDE` / `#C7C7CC`; 層級 `85%` | 標籤及內文 |
| `Text-Muted` | `#8E8E93` / `#A8A8A8`; 層級 `60%` | 區段標題及中繼資料 |
| `Text-Placeholder` | `#777777`; 層級 `45%` | 預留位置文字及停用提示 |
| `Control-Primary` | `#FFFFFF`; 文字 `#111827` / `#000000` | 主要操作 |
| `Control-Primary-Hover` | `#E5E7EB` / `#D1D5DB`; 文字 `#111827` / `#000000` | 主要操作懸停狀態 |
| `Control-Secondary` | `#242424`; 文字 `#DEDEDE` | 外框式次要操作 |
| `Toggle-Active` / `Toggle-Inactive` | `#FFFFFF` / `#48484a` | 開啟／關閉軌道；滑塊為黑色／白色 |
| `Semantic-Danger` | `#f87171`; 搭配文字 `#FFFFFF` | 必填標記、登出及刪除 |
| `Semantic-Success` | `#3bf657`; 搭配文字 `#18181b` | 成功通知及節點狀態 |

## 字體與幾何
繼承 `--font-inter`：`"Inter 18pt", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`，並啟用字體平滑。預設字重為 `500`，結構性強調使用 `600`。上表文字層級保留原始分類，並非要求一律套用透明度。
| 元素 | 字級／行高／字重，或圓角 |
| --- | --- |
| 對話框標題 | `18px` / `24px` / `600` |
| 區段標題 | `10px` / `14px` / `600` |
| 導覽項目 | `13px` / `18px` / `500` |
| 表單標籤 | `12px` / `16px` / `500` |
| 輸入框及選單文字 | `14px` / `20px` / `500` |
| 操作按鈕 | `14px` / `20px` / `600` |
| 中繼資料及小字 | `11px`-`12px` / `16px` / `500` |
| 對話框外殼及主要節點 | `20px` 圓角 |
| 內層卡片 | `14px` 圓角 |
| 控制項及導覽項目 | `10px` 圓角 |
| 次要按鈕 | `8px` 圓角 |
| 主要按鈕、切換開關及頭像 | `9999px` 圓角 |

## 版面與互動
- 亮暗主題保持一致的幾何結構。巢狀容器的內層圓角不得大於外層；保留指定的膠囊形及圓形控制項。
- 間距採用 `4px`、`8px`、`12px`、`16px`、`20px`、`24px`、`32px`。參考對話框為 `1040px` 寬、`720px` 高，上限為 `96vw` 寬、`92vh` 高。
- 區分預設、懸停、選取、焦點及停用狀態。輸入框使用 `Border-Focus` 及 `1px` 焦點外框；鍵盤焦點須清晰可見，標籤須在背景上易於辨識。
- 切換開關保留 `role="switch"` 及 `aria-checked` 語意。不得以預留位置文字取代欄位標籤。
- 對話框淡入與縮放、開關顏色與位置轉場使用 `200ms`；開關採用 ease-in-out。主要按鈕按下時縮放為 `0.95`，避免動畫造成版面位移。
- 圖示使用 `24x24` viewBox、`currentColor`、`1.75` 筆畫及圓形端點與接角；關閉及登出範例使用 `2`。常用顯示尺寸為 `16px`、`17px`、`20px`。
