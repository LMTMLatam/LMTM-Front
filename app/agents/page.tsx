"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Bot, Loader2 } from "lucide-react";
import { listAgents, hireAgent, type Agent } from "../../lib/api";
import { useSession } from "../../lib/session";

const TEMPLATES = [
  {
    id: "estrategia",
    name: "Marketing Estrategia",
    role: "strategist",
    title: "Director de estrategia",
    capabilities: "Define posicionamiento, segmentación y plan de canales.",
    systemPrompt:
      "Sos director de estrategia de marketing en LMTM. Aterrizá objetivos en un plan: posicionamiento, segmento, mensajes clave, canales priorizados, KPIs, presupuesto y hitos. Español rioplatense, accionable.",
    skills: ["marketing-estrategia", "marketing-marca", "marketing-funnel"],
  },
  {
    id: "competencia",
    name: "Marketing Competencia",
    role: "analyst",
    title: "Análisis competitivo",
    capabilities: "Audita competidores y descubre oportunidades.",
    systemPrompt:
      "Sos analista de competencia en LMTM. Identificá top 5 competidores del cliente, su posicionamiento, oferta, precios, canales, claims, debilidades y oportunidades para diferenciarnos. Estructurado en tabla.",
    skills: ["marketing-competidores", "marketing-auditoria"],
  },
  {
    id: "contenido",
    name: "Marketing Contenido",
    role: "creative",
    title: "Editor de contenido",
    capabilities: "Crea copys, posts y guiones por canal.",
    systemPrompt:
      "Sos editor de contenido senior en LMTM. Generá copys, posts, hooks y guiones por canal (IG/TikTok/email/landing) coherentes con la voz de marca dada y el objetivo del proyecto.",
    skills: ["marketing-copy", "marketing-redes", "marketing-emails"],
  },
  {
    id: "conversion",
    name: "Marketing Conversion",
    role: "optimizer",
    title: "CRO + Funnel",
    capabilities: "Optimiza landings, embudo y CRO.",
    systemPrompt:
      "Sos especialista en CRO/funnel en LMTM. Auditá landing y embudo. Listá hipótesis de mejora priorizadas por impacto/esfuerzo, métricas para medir y experimentos A/B concretos.",
    skills: ["marketing-landing", "marketing-funnel", "marketing-conversion"],
  },
  {
    id: "seo",
    name: "Marketing SEO",
    role: "seo",
    title: "SEO técnico + contenidos",
    capabilities: "SEO técnico y de contenido.",
    systemPrompt:
      "Sos especialista SEO en LMTM. Para el dominio del cliente, hacé auditoría técnica rápida (CWV, indexación, schema), keyword research por intención, cluster de contenidos y plan editorial 4 semanas.",
    skills: ["marketing-seo-contenido"],
  },
  {
    id: "dashboard",
    name: "Dashboard Agent",
    role: "data",
    title: "Datos + dashboards",
    capabilities: "Consolida métricas via MCP y publica dashboards.",
    systemPrompt:
      "Sos el Dashboard Agent de LMTM. Tu rol: consolidar datos de Meta Ads, Google Ads, Supabase y Paperclip via MCP, generar dashboards consolidados (Next.js) y desplegarlos en Vercel. Devolvé HTML/Next.js listo para deploy + URL pública prevista.",
    skills: ["specialized-mcp-builder", "data-consolidation-agent", "report-distribution-agent"],
  },
];

export default function AgentsPage() {
  const { loading, user } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState<string | null>(null);

  async function refresh() {
    setBusy(true);
    setError(null);
    try {
      const data = await listAgents();
      setAgents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!loading && user) refresh();
  }, [loading, user]);

  async function hire(template: (typeof TEMPLATES)[number]) {
    setSeeding(template.id);
    setError(null);
    try {
      await hireAgent({
        name: template.name,
        role: template.role,
        title: template.title,
        capabilities: template.capabilities,
        desiredSkills: template.skills,
        adapterType: "minimax_cloud",
        adapterConfig: {
          model: "MiniMax-M2",
          systemPrompt: template.systemPrompt,
          temperature: 0.7,
          maxTokens: 1024,
        },
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSeeding(null);
    }
  }

  if (loading || !user) return null;

  const existingNames = new Set(agents.map((a) => a.name));
  const missingTemplates = TEMPLATES.filter((t) => !existingNames.has(t.name));

  return (
    <div className="h-full overflow-y-auto scrollbar-auto-hide">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
          <p className="text-sm text-muted-foreground">
            Equipo de agentes IA contratados para esta company. Cada uno corre sobre el adapter MiniMax M2.
          </p>
        </div>

        {error ? <p className="text-xs text-red-400">{error}</p> : null}

        {busy && agents.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : null}

        {agents.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Contratados</h2>
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {agents.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.role}{a.title ? ` · ${a.title}` : ""} · {a.adapterType}
                    </p>
                  </div>
                  <Link
                    href={`/chat?agent=${encodeURIComponent(a.name)}`}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Hablar →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {missingTemplates.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Roles disponibles para contratar</h2>
            <p className="text-xs text-muted-foreground">
              Templates con prompts especializados (estrategia, competencia, contenido, conversion, SEO, dashboard). Crean un agent que corre sobre MiniMax M2.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {missingTemplates.map((t) => (
                <div key={t.id} className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{t.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.capabilities}</p>
                  <button
                    onClick={() => hire(t)}
                    disabled={seeding === t.id}
                    className="self-end flex items-center gap-1 px-2 h-8 bg-primary text-primary-foreground rounded-md text-xs font-medium disabled:opacity-50"
                  >
                    {seeding === t.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    <span>Contratar</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
