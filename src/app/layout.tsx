import type { Metadata } from "next";
import "@xyflow/react/dist/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mindverse | Agent 运行时挑战",
  description: "离线多 Agent 运行时演示：长期记忆、RAG、审批、恢复与可靠性测试。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}