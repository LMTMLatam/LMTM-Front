"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Send, Clock, User } from "lucide-react";
import { ask, agentChat, listAgents, type AgentChatMessage } from "../../lib/api";
import { useSession } from "../../lib/session";
import { cn } from "../../lib/utils";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  agent?: string;
  at: Date;
  deployUrl?: string;
};

const AGENTS_WITH_TOOLS = new Set(["dashboard"]);

const FALLBACK_AGENTS = [
  { id: "director", name: "Director", description: "Orquestador general" },
  { id: "estrategia", name: "Marketing Estrategia", description: "Plan y posicionamiento" },
  { id: "competencia", name: "Marketing Competencia", description: "Inteligencia competitiva" },
  { id: "contenido", name: "Marketing Contenido", description: "Copys y guiones" },
  { id: "conversion", name: "Marketing Conversion", description: "CRO + funnel" },
  { id: "seo", name: "Marketing SEO", description: "SEO técnico y contenidos" },
  { id: "dashboard", name: "Dashboard Agent", description: "Dashboards via MCP" },
];

function normalize(name: string) {
  return name
    .toLowerCase()
    .replace(/^marketing\s+/, "")
    .replace(/\s+agent$/, "")
    .replace(/\s+/g, "_");
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const { loading, user } = useSession();
  const params = useSearchParams();
  const [agents, setAgents] = useState<typeof FALLBACK_AGENTS>(FALLBACK_AGENTS);
  const [selected, setSelected] = useState<string>(FALLBACK_AGENTS[0].id);
  const [client, setClient] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      listAgents()
        .then((real) => {
          if (real.length === 0) return;
          setAgents(
            real.map((a) => ({
              id: normalize(a.name),
              name: a.name,
              description: a.title ?? a.role,
            })),
          );
        })
        .catch(() => {});
    }
  }, [loading, user]);

  useEffect(() => {
    const wanted = params?.get("agent");
    if (!wanted) return;
    const match = agents.find((a) => a.name === wanted) ?? agents.find((a) => a.id === wanted);
    if (match) setSelected(match.id);
  }, [params, agents]);

  const current = useMemo(() => agents.find((a) => a.id === selected) ?? agents[0], [agents, selected]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: text, at: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    try {
      if (AGENTS_WITH_TOOLS.has(current.id)) {
        const history: AgentChatMessage[] = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const reply = await agentChat({ agent: current.id, messages: history, client: client || undefined });
        const deployed = reply.toolTrace.find((t) => t.name === "deploy_dashboard" && (t.result as { url?: string })?.url);
        const deployUrl = (deployed?.result as { url?: string } | undefined)?.url;
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: reply.output || (deployUrl ? `Listo: ${deployUrl}` : "Sin respuesta"),
            agent: reply.agent ?? current.name,
            at: new Date(),
            deployUrl,
          },
        ]);
      } else {
        const reply = await ask(text, current.id, client || undefined);
        const content = reply.output ?? reply.detail ?? reply.error ?? "Sin respuesta";
        setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", content, agent: reply.agent ?? current.name, at: new Date() }]);
      }
    } catch (e) {
      setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", content: `Error: ${e instanceof Error ? e.message : String(e)}`, at: new Date() }]);
    } finally {
      setSending(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="h-full flex">
      <aside className="w-64 border-r border-border bg-card shrink-0 flex flex-col">
        <div className="p-3 border-b border-border">
          <h2 className="text-sm font-semibold">Agentes</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 scrollbar-auto-hide">
          {agents.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                selected === a.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50",
              )}
            >
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 shrink-0" />
                <span className="font-medium">{a.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 px-4 flex items-center gap-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-muted-foreground" />
            <div>
              <h1 className="text-sm font-semibold">{current.name}</h1>
              <p className="text-xs text-muted-foreground">{current.description}</p>
            </div>
          </div>
          <div className="flex-1" />
          <input
            type="text"
            placeholder="Cliente (opcional)"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="h-8 w-40 px-3 text-sm bg-secondary border border-input rounded-md"
          />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-auto-hide">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">Chat con {current.name}</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Enviá un mensaje para empezar. Podés pasar un cliente como contexto.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex gap-3 px-4 py-4", m.role === "user" ? "bg-accent/30" : "bg-card")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                    {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{m.role === "user" ? "You" : m.agent ?? current.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {m.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    {m.deployUrl ? (
                      <a
                        href={m.deployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs text-green-400 underline"
                      >
                        {m.deployUrl}
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
              {sending ? (
                <div className="flex gap-3 px-4 py-4 bg-card">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-muted-foreground">Pensando…</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu mensaje..."
              className="flex-1 h-10 px-4 text-sm bg-secondary border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
