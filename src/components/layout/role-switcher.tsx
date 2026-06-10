"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, UserCog } from "lucide-react";

import { useRole } from "@/components/providers/role-context";
import { ROLE_ORDER, ROLES, type Role } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RoleSwitcher() {
  const { role, config, setRole } = useRole();
  const router = useRouter();

  function handleSelect(next: Role) {
    setRole(next);
    router.push(ROLES[next].home); // 切换角色即跳到该角色默认落地页
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserCog className="h-4 w-4" />
          <span className="hidden sm:inline">视角:</span>
          {config.label}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>切换演示视角</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLE_ORDER.map((key) => {
          const r = ROLES[key];
          const active = key === role;
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => handleSelect(key)}
              className="flex-col items-start gap-0.5"
            >
              <span className="font-medium">
                {r.label}
                {active && <span className="ml-2 text-xs text-primary">当前</span>}
              </span>
              <span className="text-xs text-muted-foreground">
                {r.description}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
