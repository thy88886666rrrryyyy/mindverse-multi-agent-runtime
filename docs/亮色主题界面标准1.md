# Light Theme UI Guidelines

Adapted from Mindverse design guidelines; condensed, not a verbatim reproduction. Applies to dashboards, settings modals, drawers, and workflow cards. Source references: Figma palette `379:118`, Image Node `218:81`, and accent `320:140`.

## Color Tokens
Use neutral surface layers and fine borders, not flat white layouts or heavy shadows. Reserve the existing sand accent for badges or special highlights. Slash-separated values are contextual alternatives.
| Token | Value | Use |
| --- | --- | --- |
| `Surface-Backdrop` | `rgba(0, 0, 0, 0.35)` | Modal overlay with medium backdrop blur |
| `Surface-Base` | `#F5F5F5` / `#E9E9E9` | Page and canvas |
| `Surface-Modal` | `#FFFFFF` | Modal shell and expanded content |
| `Surface-Node-Preview` | `#E9E9E9` | Node preview, dropdown, sidebar |
| `Surface-Card-Secondary` | `#E9E9E9` | Secondary cards and unselected items |
| `Surface-Control` | `#FFFFFF` / `#E9E9E9` | Inputs, textareas, selects |
| `Surface-Active` | `#D9D9D9` / `#D2D2D2` | Selected navigation and tiles |
| `Surface-Hover` | `#D9D9D9` / `rgba(0, 0, 0, 0.05)` | Unselected item hover |
| `Border-Subtle` | `#6b6b6b`; `0.5px` | Shell, primary node, dropdown |
| `Border-Control` | `#a3a3a3` / `#d2d2d2`; `0.5px` / `1px` | Controls, secondary cards, outline buttons |
| `Border-Focus` | `#000000` / `#6b6b6b`; `1px` | Focus ring and selected border |
| `Border-Run-Button` | `#727272`; `1px` | Primary black action border |
| `Divider-Muted` | `rgba(107, 107, 107, 0.25)` / `#d2d2d2`; `0.5px` / `1px` | Section, menu, header/footer separators |
| `Text-Primary` | `#000000`; level `100%` | Titles, active labels, values |
| `Text-Regular` | `#242424` / `#000000`; level `85%`-`100%` | Labels and body copy |
| `Text-Muted` | `#6b6b6b`; level `65%` | Section headings and metadata |
| `Text-Placeholder` | `#a3a3a3`; level `50%` | Placeholders, disabled hints, chevrons |
| `Control-Primary` | `#000000`; text `#FFFFFF` | Primary action with `Border-Run-Button` |
| `Control-Primary-Hover` | `#1a1a1a` / `#242424`; text `#FFFFFF` | Primary hover |
| `Control-Secondary` | `#e9e9e9` / `#ffffff`; text `#000000` | Outline action |
| `Control-Secondary-Hover` | `#d9d9d9` / `#d2d2d2`; text `#000000` | Secondary hover |
| `Accent-Warm-Sand` | `#cfae8c`; text `#000000` | Existing brand or badge accent |
| `Toggle-Active` / `Toggle-Inactive` | `#000000` / `#d2d2d2` | On / off tracks; white thumb |
| `Semantic-Danger` | `#dc2626` / `#ef4444`; paired text `#FFFFFF` | Required marks, sign out, deletion |
| `Semantic-Success` | `#16a34a` / `#3bf657`; paired text `#FFFFFF` | Success alerts and node status |

## Typography and Geometry
Inherit `--font-inter`: `"Inter 18pt", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`, with font smoothing. Use `Finlandica` only for specified node chrome. Default weight is `500`; emphasis uses `600`. Text levels retain the source hierarchy, not a blanket opacity requirement.
| Element | Size / line height / weight, or radius |
| --- | --- |
| Modal title | `18px` / `24px` / `600` |
| Node header | `15px`-`16px` / `20px` / `400` or `500` |
| Section heading | `10px` / `14px` / `600` |
| Navigation item | `13px` / `18px` / `500` |
| Form label and node parameter | `12px` / `16px` / `500` |
| Input and select text | `14px` / `20px` / `500` |
| Action button | `14px` / `20px` / `600` |
| Metadata and port label | `11px`-`12px` / `16px` / `500` |
| Modal shell and primary node | `20px` radius; `12px` at compact Figma scale |
| Inner card | `14px` radius; compact node dropdown example uses `12px` |
| Control and navigation item | `10px` radius |
| Secondary button | `8px` radius |
| Primary button, toggle, avatar | `9999px` radius |

## Layout and Interaction
- Keep geometry consistent across themes. Nested container radii must not exceed outer radii; retain the designated pill and circular controls and documented compact exceptions.
- Use spacing steps `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`. The reference modal is `1040px` by `720px`, capped at `96vw` by `92vh`.
- Distinguish default, hover, selected, focused, and disabled states. Inputs use `Border-Focus` with a `1px` focus ring; keep keyboard focus visible and labels legible against their surfaces.
- Preserve switch semantics with `role="switch"` and `aria-checked`. Do not substitute placeholder text for a field label.
- Use `200ms` modal fade/scale and toggle color/position transitions; toggles use ease-in-out. Primary pressed scale is `0.95`; avoid motion that shifts layout.
- Icons use a `24x24` viewBox, `currentColor`, `1.75` stroke, and round caps/joins; close and sign-out examples use `2`. Typical display sizes are `16px`, `17px`, and `20px`; inherit black or muted text color.

---

# 亮色主題介面指引

本指引依據 Mindverse 設計規範改編及精簡，並非逐字轉載。適用於儀表板、設定對話框、抽屜面板及工作流程卡片。來源參考：Figma 色票 `379:118`、影像節點 `218:81` 及強調色 `320:140`。

## 色彩權杖
以中性背景層次及細邊框建立層級，避免純白平鋪及厚重陰影。既有沙金色僅用於徽章或特殊強調。斜線分隔的數值為依情境選用的替代值。
| 權杖 | 數值 | 用途 |
| --- | --- | --- |
| `Surface-Backdrop` | `rgba(0, 0, 0, 0.35)` | 對話框遮罩，搭配中度背景模糊 |
| `Surface-Base` | `#F5F5F5` / `#E9E9E9` | 頁面及畫布 |
| `Surface-Modal` | `#FFFFFF` | 對話框外殼及展開內容 |
| `Surface-Node-Preview` | `#E9E9E9` | 節點預覽、下拉選單及側邊欄 |
| `Surface-Card-Secondary` | `#E9E9E9` | 次級卡片及未選取項目 |
| `Surface-Control` | `#FFFFFF` / `#E9E9E9` | 輸入框、文字區域及選單 |
| `Surface-Active` | `#D9D9D9` / `#D2D2D2` | 已選取的導覽項目及區塊 |
| `Surface-Hover` | `#D9D9D9` / `rgba(0, 0, 0, 0.05)` | 未選取項目的懸停背景 |
| `Border-Subtle` | `#6b6b6b`; `0.5px` | 外殼、主要節點及下拉選單 |
| `Border-Control` | `#a3a3a3` / `#d2d2d2`; `0.5px` / `1px` | 控制項、次級卡片及外框按鈕 |
| `Border-Focus` | `#000000` / `#6b6b6b`; `1px` | 焦點外框及選取邊框 |
| `Border-Run-Button` | `#727272`; `1px` | 主要黑色操作按鈕邊框 |
| `Divider-Muted` | `rgba(107, 107, 107, 0.25)` / `#d2d2d2`; `0.5px` / `1px` | 區段、選單及頁首頁尾分隔線 |
| `Text-Primary` | `#000000`; 層級 `100%` | 標題、作用中標籤及輸入值 |
| `Text-Regular` | `#242424` / `#000000`; 層級 `85%`-`100%` | 標籤及內文 |
| `Text-Muted` | `#6b6b6b`; 層級 `65%` | 區段標題及中繼資料 |
| `Text-Placeholder` | `#a3a3a3`; 層級 `50%` | 預留位置文字、停用提示及箭頭 |
| `Control-Primary` | `#000000`; 文字 `#FFFFFF` | 主要操作，搭配 `Border-Run-Button` |
| `Control-Primary-Hover` | `#1a1a1a` / `#242424`; 文字 `#FFFFFF` | 主要操作懸停狀態 |
| `Control-Secondary` | `#e9e9e9` / `#ffffff`; 文字 `#000000` | 外框式次要操作 |
| `Control-Secondary-Hover` | `#d9d9d9` / `#d2d2d2`; 文字 `#000000` | 次要操作懸停狀態 |
| `Accent-Warm-Sand` | `#cfae8c`; 文字 `#000000` | 既有品牌或徽章強調色 |
| `Toggle-Active` / `Toggle-Inactive` | `#000000` / `#d2d2d2` | 開啟／關閉軌道；滑塊為白色 |
| `Semantic-Danger` | `#dc2626` / `#ef4444`; 搭配文字 `#FFFFFF` | 必填標記、登出及刪除 |
| `Semantic-Success` | `#16a34a` / `#3bf657`; 搭配文字 `#FFFFFF` | 成功通知及節點狀態 |

## 字體與幾何
繼承 `--font-inter`：`"Inter 18pt", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`，並啟用字體平滑。僅於指定節點介面使用 `Finlandica`。預設字重為 `500`，強調使用 `600`。文字層級保留原始分類，並非要求一律套用透明度。
| 元素 | 字級／行高／字重，或圓角 |
| --- | --- |
| 對話框標題 | `18px` / `24px` / `600` |
| 節點標題 | `15px`-`16px` / `20px` / `400` 或 `500` |
| 區段標題 | `10px` / `14px` / `600` |
| 導覽項目 | `13px` / `18px` / `500` |
| 表單標籤及節點參數 | `12px` / `16px` / `500` |
| 輸入框及選單文字 | `14px` / `20px` / `500` |
| 操作按鈕 | `14px` / `20px` / `600` |
| 中繼資料及連接埠標籤 | `11px`-`12px` / `16px` / `500` |
| 對話框外殼及主要節點 | `20px` 圓角；緊湊 Figma 比例採用 `12px` |
| 內層卡片 | `14px` 圓角；緊湊節點下拉選單範例採用 `12px` |
| 控制項及導覽項目 | `10px` 圓角 |
| 次要按鈕 | `8px` 圓角 |
| 主要按鈕、切換開關及頭像 | `9999px` 圓角 |

## 版面與互動
- 亮暗主題保持一致的幾何結構。巢狀容器的內層圓角不得大於外層；保留指定的膠囊形、圓形控制項及已記載的緊湊尺寸例外。
- 間距採用 `4px`、`8px`、`12px`、`16px`、`20px`、`24px`、`32px`。參考對話框為 `1040px` 寬、`720px` 高，上限為 `96vw` 寬、`92vh` 高。
- 區分預設、懸停、選取、焦點及停用狀態。輸入框使用 `Border-Focus` 及 `1px` 焦點外框；鍵盤焦點須清晰可見，標籤須在背景上易於辨識。
- 切換開關保留 `role="switch"` 及 `aria-checked` 語意。不得以預留位置文字取代欄位標籤。
- 對話框淡入與縮放、開關顏色與位置轉場使用 `200ms`；開關採用 ease-in-out。主要按鈕按下時縮放為 `0.95`，避免動畫造成版面位移。
- 圖示使用 `24x24` viewBox、`currentColor`、`1.75` 筆畫及圓形端點與接角；關閉及登出範例使用 `2`。常用顯示尺寸為 `16px`、`17px`、`20px`，繼承黑色或次要文字色。
