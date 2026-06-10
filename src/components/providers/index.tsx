"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";

import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/components/providers/role-context";

/** 全局 Provider 聚合:主题 + 角色 + Tooltip。 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <RoleProvider>
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
      </RoleProvider>
    </ThemeProvider>
  );
}
