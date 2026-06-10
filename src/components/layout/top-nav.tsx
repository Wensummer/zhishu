"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { useRole } from "@/components/providers/role-context";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function TopNav() {
  const { config } = useRole();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-6 px-4 md:px-6">
        {/* Logo / 落地页入口 */}
        <Link href="/landing" className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="text-base">智枢</span>
          <span className="hidden text-xs font-normal text-muted-foreground md:inline">
            合规大模型选型 · 营销赋能
          </span>
        </Link>

        {/* 主导航(随角色变化) */}
        <nav className="hidden items-center gap-1 md:flex">
          {config.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive(pathname, item.href)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <RoleSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {/* 移动端导航:横向滚动 */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t px-4 py-1.5 md:hidden">
        {config.nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors",
              isActive(pathname, item.href)
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
