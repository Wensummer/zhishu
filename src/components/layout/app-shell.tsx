import * as React from "react";

import { TopNav } from "@/components/layout/top-nav";
import { SupportChatbot } from "@/components/support/support-chatbot";

/** 全站外壳:顶栏 + 内容容器 + 全局答疑浮窗。 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
      <SupportChatbot />
    </div>
  );
}
