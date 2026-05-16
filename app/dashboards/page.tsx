"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, ExternalLink, Loader2, Rocket, Sparkles } from "lucide-react";
import {
  ask,
  deployDashboard,
  listMetaConnections,
  getMetaInsights,
  type MetaConnection,
} from "../../lib/api";
import { useSession } from "../../lib/session";

type Phase = "idle" | "generating" | "ready" | "deploying" | "deployed";

const SYSTEM_HINT = [
  "Devolveme SOLO un documento HTML completo (<!doctype html>...</html>) listo para servir como un index.html estático.",
  "Incluí estilos inline o <style> en el head (sin frameworks externos).",
  "Usá tarjetas con KPIs claros y una sección con el plan de fuentes de datos vía MCP.",
  "Diseño dark, tipografía sans-serif, máximo 1000 líneas.",
].join("\n");

function extractHtml(text: string): string {
  const fenced = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text.trim();
  if (/<!doctype\s+html/i.test(candidate) || /<html[\s>]/i.test(candidate)) {
    return candidate;
  }
  // Wrap fragment in a minimal document
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"/><title>Dashboard</title>
<style>body{font:14px/1.5 system-ui,sans-serif;background:#0a0a0a;color:#fafafa;margin:0;padding:2rem}main{max-width:960px;margin:0 auto}</style>
</head><body><main>${candidate}</main></body></html>`;
}

export default function DashboardsPage() {
  const { loading, user } = useSession();
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [html, setHtml] = useState("");
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metaConns, setMetaConns] = useState<MetaConnection[]>([]);
  const [metaConnId, setMetaConnId] = useState<string>("");
  const [datePreset, setDatePreset] = useState<string>("last_30d");

  useEffect(() => {
    if (!loading && user) {
      listMetaConnections()
        .then((rows) => setMetaConns(rows.filter((r) => r.status === "active")))
        .catch(() => setMetaConns([]));
    }
  }, [loading, user]);

  async function buildMetaContext(): Promise<string> {
    if (!metaConnId) return "";
    try {
      const r = await getMetaInsights({ connection: metaConnId, datePreset });
      const conn = metaConns.find((c) => c.id === metaConnId);
      const summary = {
        source: "meta_ads",
        connectionLabel: conn?.label,
        adAccount: r.adAccount,
        datePreset,
        rows: r.rows,
      };
      return `\n\nDATOS REALES (Meta Ads) — usalos como base del dashboard:\n\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\``;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return `\n\nNota: No pude obtener datos de Meta (${msg}). Generá el dashboard con placeholders y mencionálo.`;
    }
  }

  async function generate() {
    if (!prompt.trim() || !name.trim()) return;
    setPhase("generating");
    setError(null);
    setDeployedUrl(null);
    setHtml("");
    try {
      const metaContext = await buildMetaContext();
      const reply = await ask(`${prompt}${metaContext}\n\n${SYSTEM_HINT}`, "dashboard", name);
      const text = reply.output ?? reply.detail ?? reply.error ?? "";
      if (!text) throw new Error("Respuesta vacía del Dashboard Agent");
      setHtml(extractHtml(text));
      setPhase("ready");
    } catch (e) {
      setPhase("idle");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function deploy() {
    if (!html.trim()) return;
    setPhase("deploying");
    setError(null);
    try {
      const r = await deployDashboard({ name, html, target: "production" });
      setDeployedUrl(r.url);
      setPhase("deployed");
    } catch (e) {
      setPhase("ready");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading || !user) return null;

  return (
    <div className="h-full overflow-y-auto scrollbar-auto-hide">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboards</h1>
          <p className="text-sm text-muted-foreground">
            El Dashboard Agent genera un HTML estático y el helper lo deploya a Vercel.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <input
            placeholder="Nombre del dashboard (slug autoderivado)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 text-sm bg-secondary border border-input rounded-md"
          />
          <textarea
            placeholder="Describí el dashboard. Ej: KPIs de performance ads Q2 — ROAS / CPA / CTR por canal, fuentes Meta Ads + Google Ads via MCP."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm bg-secondary border border-input rounded-md resize-none font-mono"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={metaConnId}
              onChange={(e) => setMetaConnId(e.target.value)}
              className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
            >
              <option value="">— Sin datos de Meta (placeholders) —</option>
              {metaConns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                  {c.adAccountId ? ` (${c.adAccountId})` : ""}
                </option>
              ))}
            </select>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
              disabled={!metaConnId}
            >
              <option value="last_7d">Últimos 7 días</option>
              <option value="last_14d">Últimos 14 días</option>
              <option value="last_28d">Últimos 28 días</option>
              <option value="last_30d">Últimos 30 días</option>
              <option value="last_90d">Últimos 90 días</option>
              <option value="this_month">Este mes</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2 justify-between">
            <p className="text-xs text-muted-foreground">
              Workflow: <b>Generar</b> → revisar preview → <b>Deploy</b> a Vercel.
            </p>
            <div className="flex gap-2">
              <button
                onClick={generate}
                disabled={phase === "generating" || phase === "deploying" || !prompt.trim() || !name.trim()}
                className="flex items-center gap-2 px-3 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
              >
                {phase === "generating" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>Generar</span>
              </button>
              <button
                onClick={deploy}
                disabled={phase !== "ready" && phase !== "deployed"}
                className="flex items-center gap-2 px-3 h-9 bg-green-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
              >
                {phase === "deploying" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                <span>Deploy a Vercel</span>
              </button>
            </div>
          </div>
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          {deployedUrl ? (
            <a
              href={deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-green-400 underline"
            >
              {deployedUrl}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>

        {phase === "generating" ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Bot className="h-4 w-4" /> Dashboard Agent pensando…
          </div>
        ) : null}

        {html ? (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Preview</h2>
            <iframe
              srcDoc={html}
              className="w-full h-[480px] bg-white rounded-lg border border-border"
              sandbox="allow-same-origin"
              title="dashboard preview"
            />
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">Ver HTML</summary>
              <pre className="mt-2 bg-secondary p-3 rounded text-[11px] overflow-auto max-h-72 whitespace-pre-wrap break-all">
                {html}
              </pre>
            </details>
          </section>
        ) : null}

        <p className="text-xs text-muted-foreground">
          ¿Necesitás datos reales? Levantá el <Link href="https://github.com/LMTMLatam/lmtm-os/tree/render-setup-lmtm/packages/mcp-servers/supabase" className="underline">MCP server de Supabase</Link> en tu cliente MCP (Claude Desktop / Cursor / Cline) y pegale los resultados al prompt.
        </p>
      </div>
    </div>
  );
}
