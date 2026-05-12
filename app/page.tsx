"use client";

import { Bot, CircleDot, DollarSign, Activity, Clock, TrendingUp } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { cn } from "../lib/utils";

const metrics = [
  { icon: Bot, value: "9", label: "Active Agents", description: "Running 24/7", to: "/chat" },
  { icon: CircleDot, value: "24", label: "Projects", description: "3 completed this month", to: "/projects" },
  { icon: DollarSign, value: "$12.4k", label: "Revenue MRR", description: "+18% from last month" },
  { icon: Activity, value: "147", label: "Tasks Completed", description: "This month" },
];

const recentActivity = [
  { id: 1, agent: "CEO Agent", action: "Generated Q2 report", time: "2 min ago", type: "report" },
  { id: 2, agent: "Dashboard Agent", action: "Updated metrics for Hotel Plaza", time: "5 min ago", type: "update" },
  { id: 3, agent: "Creativo Agent", action: "Created 5 copy variations", time: "12 min ago", type: "create" },
  { id: 4, agent: "Operativo Agent", action: "Checked 8 deadlines", time: "18 min ago", type: "check" },
  { id: 5, agent: "Feedback Agent", action: "Processed 3 client feedbacks", time: "25 min ago", type: "process" },
];

export default function Dashboard() {
  return (
    <div className="h-full overflow-y-auto scrollbar-auto-hide">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back. Here&apos;s what&apos;s happening with your agency.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="col-span-2 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            <div className="bg-card rounded-lg border border-border divide-y divide-border">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.agent}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.action}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
            <div className="bg-card rounded-lg border border-border p-4 space-y-2">
              <QuickAction href="/chat" label="New Chat" description="Talk to an agent" icon={Bot} />
              <QuickAction href="/projects" label="View Projects" description="Manage active work" icon={CircleDot} />
              <QuickAction href="/goals" label="Track Goals" description="Check objectives" icon={TrendingUp} />
            </div>

            {/* System Status */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                System Status
              </h3>
              <div className="space-y-2">
                <StatusRow label="Backend API" status="operational" />
                <StatusRow label="MiniMax LLM" status="operational" />
                <StatusRow label="Database" status="operational" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  description,
  icon: Icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-accent/50 transition-colors group"
    >
      <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </a>
  );
}

function StatusRow({ label, status }: { label: string; status: "operational" | "degraded" | "down" }) {
  const colors = {
    operational: "bg-green-500",
    degraded: "bg-yellow-500",
    down: "bg-red-500",
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", colors[status])} />
        <span className="text-xs capitalize text-muted-foreground">{status}</span>
      </div>
    </div>
  );
}