"use client";

import { useState, useEffect, useRef } from "react";

const AGENTS = [
  { id: "director", name: "Director", description: "Orquestador - deriva al agente correcto", icon: "🎯" },
  { id: "briefing", name: "Briefing", description: "Convierte solicitudes en briefings estructurados", icon: "📋" },
  { id: "dashboard", name: "Dashboard", description: "Genera y gestiona dashboards de clientes", icon: "📊" },
  { id: "creativo", name: "Creativo", description: "Hooks, copys, ideas, guiones", icon: "💡" },
  { id: "ceo", name: "CEO", description: "Reportes ejecutivos y score de cuentas", icon: "📈" },
  { id: "operativo", name: "Operativo", description: "Estado de tareas y deadlines", icon: "⚡" },
  { id: "feedback", name: "Feedback", description: "Procesa comentarios de clientes", icon: "💬" },
  { id: "performance", name: "Performance", description: "Análisis de métricas de ads", icon: "🎯" },
  { id: "customer_brain", name: "Customer Brain", description: "Perfil y preferencias de clientes", icon: "🧠" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  agent?: string;
  timestamp: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lmtm.onrender.com";

export default function ChatPage() {
  const [selectedAgent, setSelectedAgent] = useState("director");
  const [clientName, setClientName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          agent: selectedAgent,
          client: clientName || undefined,
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.output || "Sin respuesta",
        agent: data.agent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error}`, timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentAgent = AGENTS.find((a) => a.id === selectedAgent);

  return (
    <div className="h-screen flex bg-[#0a0a0f] text-white overflow-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        :root {
          --accent: #00f0ff;
          --accent-dim: rgba(0, 240, 255, 0.15);
          --bg-dark: #0a0a0f;
          --bg-card: #12121a;
          --bg-hover: #1a1a24;
        }
        
        body {
          font-family: 'Outfit', sans-serif;
          background: #0a0a0f;
        }
        
        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }
        
        .glow {
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.1);
        }
        
        .glow-text {
          text-shadow: 0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3);
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        
        .typing-dot {
          animation: typing 1.4s ease-in-out infinite;
        }
        
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #12121a;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #2a2a3a;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #3a3a4a;
        }
      `}</style>

      {/* Agent sidebar */}
      <div
        className={`w-80 bg-[#12121a] border-r border-white/5 flex flex-col transition-all duration-300 ${
          mounted ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center font-bold text-black">
              LM
            </div>
            <div>
              <h1 className="font-semibold text-lg tracking-tight">LMTM</h1>
              <p className="text-xs text-white/40">Agency OS</p>
            </div>
          </div>
        </div>

        {/* Agent list */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-3 px-3">Agentes</p>
          <div className="space-y-1">
            {AGENTS.map((agent, index) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                  selectedAgent === agent.id
                    ? "bg-[var(--accent-dim)] border border-cyan-400/30"
                    : "hover:bg-white/5 border border-transparent"
                } ${mounted ? "animate-slide-up" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{agent.name}</div>
                    <div className="text-xs text-white/40 line-clamp-1 group-hover:text-white/60 transition-colors">
                      {agent.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Backend connected
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#12121a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 border border-cyan-400/30 flex items-center justify-center text-2xl">
                {currentAgent?.icon}
              </div>
              <div>
                <h2 className="font-semibold text-lg">{currentAgent?.name}</h2>
                <p className="text-sm text-white/40">{currentAgent?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Cliente (opcional)"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors w-48 placeholder:text-white/20"
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400/10 to-cyan-600/10 border border-cyan-400/20 flex items-center justify-center mb-6">
                <span className="text-4xl">{currentAgent?.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chat con {currentAgent?.name}</h3>
              <p className="text-white/40 max-w-md">
                Envía un mensaje para interactuar con el agente. También puedes especificar un cliente para contexto.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={`max-w-2xl rounded-2xl px-5 py-4 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-black"
                    : "bg-[#12121a] border border-white/10"
                }`}
              >
                {msg.role === "assistant" && msg.agent && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 mb-2 font-mono">
                    <span>{AGENTS.find((a) => a.id === msg.agent)?.icon}</span>
                    <span>{msg.agent.toUpperCase()}</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <div
                  className={`text-xs mt-2 ${msg.role === "user" ? "text-cyan-100/60" : "text-white/30"}`}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-slide-up">
              <div className="bg-[#12121a] border border-white/10 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="typing-dot w-2 h-2 rounded-full bg-cyan-400" />
                  <div className="typing-dot w-2 h-2 rounded-full bg-cyan-400" />
                  <div className="typing-dot w-2 h-2 rounded-full bg-cyan-400" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-[#12121a]/80 backdrop-blur-xl border-t border-white/5 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-3 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-cyan-400/50 transition-colors placeholder:text-white/20"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-semibold rounded-xl hover:from-cyan-400 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="typing-dot w-2 h-2 rounded-full bg-black/50" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-black/50" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-black/50" />
                </span>
              ) : (
                "Enviar"
              )}
            </button>
          </form>
          <p className="text-center text-xs text-white/20 mt-3 max-w-4xl mx-auto">
            Powered by MiniMax • LMTM Agency OS
          </p>
        </div>
      </div>
    </div>
  );
}