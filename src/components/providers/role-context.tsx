"use client";

import * as React from "react";

import { DEFAULT_ROLE, ROLES, type Role, type RoleConfig } from "@/lib/roles";

interface RoleContextValue {
  role: Role;
  config: RoleConfig;
  setRole: (role: Role) => void;
}

const RoleContext = React.createContext<RoleContextValue | null>(null);

const STORAGE_KEY = "zhishu.role";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>(DEFAULT_ROLE);

  // 启动时从 localStorage 恢复角色(演示时切换后刷新仍保持)。
  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Role | null;
    if (saved && saved in ROLES) {
      setRoleState(saved);
    }
  }, []);

  const setRole = React.useCallback((next: Role) => {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = React.useMemo<RoleContextValue>(
    () => ({ role, config: ROLES[role], setRole }),
    [role, setRole]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = React.useContext(RoleContext);
  if (!ctx) throw new Error("useRole 必须在 RoleProvider 内使用");
  return ctx;
}
