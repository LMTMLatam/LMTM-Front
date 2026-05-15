"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, FolderKanban, Target, Activity } from "lucide-react";
import { listProjects, listGoals, listAgents, getHealth } from "../lib/api";
import { useSession } from "../lib/session";
import { cn } from "../lib/utils";

export default function Dashboard() {
  const { user, loading } = useSession();
  const [counts, setCounts] = useState({ projects: 0, goals: 0, agents: 0 });
  const [health, setHealth] = useState<string>("...");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    Promise.all([listProjects(), listGoals(), listAgents(), getHealth()])
      .then(([p, g, a, h]) => {
        setCounts({ projects: p.length, goals: g.length, agents: a.length });
        setHealth(h.status);
      })
      .catch(() => setHealth("error"))
      .finally(() => setLoaded(true));
  }, [loading, user]);

  if (loading || !user) return null;

  return (
    <div className="h-full overflow-y-auto scrollbar-auto-hide">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido {user.name ?? user.email}. Resumen de tu agencia.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <StatCard icon={FolderKanban} label="Proyectos" value={counts.projects} href="/projects" />
          <StatCard icon={Target} label="Goals" value={counts.goals} href="/goals" />
          <StatCard icon={Bot} label="Agents" value={counts.agents} href="/agents" />
          <StatCard icon={Activity} label="Backend" value={health} valueColor={health === "ok" ? "text-green-400" : "text-yellow-400"} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-3">
            <h2 className="text-sm font-semibold">Acciones rápidas</h2>
            <div className="bg-card rounded-lg border border-border divide-y divide-border">
              <QuickRow href="/projects" label="Crear proyecto" hint="Nuevo proyecto de marketing" />
              <QuickRow href="/goals" label="Crear goal" hint="Define un objetivo SMART" />
              <QuickRow href="/agents" label="Ver agents" hint="Equipo de agentes IA disponibles" />
              <QuickRow href="/chat" label="Hablar con un agent" hint="Chat 1:1 con uno de los agentes" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Sistema</h2>
            <div className="bg-card rounded-lg border border-border p-4 text-xs space-y-2">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Backend</span><span className={cn(health === "ok" ? "text-green-400" : "text-yellow-400")}>{health}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">LLM</span><span className="text-green-400">MiniMax M2</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Adapter</span><span className="text-green-400">minimax_cloud</span></div>
              {loaded ? null : <p className="text-muted-foreground">Cargando datos…</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, href, valueColor }: { icon: React.ElementType; label: string; value: number | string; href?: string; valueColor?: string }) {
  const inner = (
    <div className="bg-card rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className={cn("text-2xl font-semibold", valueColor)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function QuickRow({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors first:rounded-t-lg last:rounded-b-lg">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <span className="text-muted-foreground">→</span>
    </Link>
  );
}
