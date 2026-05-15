"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { useSession } from "../lib/session";
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  Target,
  Bot,
  LogOut,
  Circle,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/agents", icon: Bot, label: "Agents" },
  { href: "/chat", icon: MessageSquare, label: "Chat" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useSession();

  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <aside className="w-56 h-full flex flex-col border-r border-border bg-card shrink-0">
      <div className="h-12 px-3 flex items-center gap-2 border-b border-border shrink-0">
        <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center">
          <span className="text-[10px] font-bold text-background">LM</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">LMTM</p>
          {user ? (
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto py-2 px-2 scrollbar-auto-hide">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-border shrink-0 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          <span>All systems operational</span>
        </div>
        {user ? (
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        ) : null}
      </div>
    </aside>
  );
}
