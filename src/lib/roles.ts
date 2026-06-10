/**
 * 角色定义与各角色可见导航。
 * 单应用 + 角色切换器:同一套布局演示多视角。
 */

export type Role = "manager" | "admin" | "boss" | "enduser";

export interface NavItem {
  href: string;
  label: string;
}

export interface RoleConfig {
  key: Role;
  label: string; // 顶栏显示名
  home: string; // 该角色默认落地路由
  description: string; // 切换器里的一句话说明
  nav: NavItem[]; // 该角色可见的主导航
}

export const ROLES: Record<Role, RoleConfig> = {
  manager: {
    key: "manager",
    label: "客户经理",
    home: "/",
    description: "选型 → 简报 → 通话的主作业视角",
    nav: [
      { href: "/", label: "工作台" },
      { href: "/models", label: "模型横评" },
      { href: "/status", label: "状态监控" },
      { href: "/wizard", label: "四问选型" },
    ],
  },
  admin: {
    key: "admin",
    label: "管理员",
    home: "/admin",
    description: "平台运营、配置与合规管理",
    nav: [
      { href: "/admin", label: "数据大屏" },
      { href: "/admin/products", label: "产品配置" },
      { href: "/admin/pricing", label: "价格配置" },
      { href: "/admin/operations", label: "运营分析" },
      { href: "/admin/compliance", label: "合规管理" },
      { href: "/status", label: "状态监控" },
    ],
  },
  boss: {
    key: "boss",
    label: "甲方老板",
    home: "/panel/boss",
    description: "总量、成本与各部门用量总览",
    nav: [
      { href: "/panel/boss", label: "经营总览" },
      { href: "/console", label: "API 控制台" },
      { href: "/status", label: "状态监控" },
    ],
  },
  enduser: {
    key: "enduser",
    label: "C端用户",
    home: "/panel/user",
    description: "个人用量、计费与自助选型",
    nav: [
      { href: "/panel/user", label: "我的用量" },
      { href: "/wizard", label: "四问选型" },
      { href: "/console", label: "API 控制台" },
    ],
  },
};

export const ROLE_ORDER: Role[] = ["manager", "admin", "boss", "enduser"];
export const DEFAULT_ROLE: Role = "manager";
