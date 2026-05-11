"use client";

import { useState } from "react";

const AGENTS = [
  { id: "director", name: "Director", description: "Orquestador - deriva al agente correcto" },
  { id: "briefing", name: "Briefing", description: "Convierte solicitudes en briefings estructurados" },
  { id: "dashboard", name: "Dashboard", description: "Genera y gestiona dashboards de clientes" },
  { id: "creativo", name: "Creativo", description: "Hooks, copys, ideas, guiones" },
  { id: "ceo", name: "CEO", description: "Reportes ejecutivos y score de cuentas" },
  { id: "operativo", name: "Operativo", description: "Estado de tareas y deadlines" },
  { id: "feedback", name: "Feedback", description: "Procesa comentarios de clientes" },
  { id: "performance", name: "Performance", description: "Análisis de métricas de ads" },
  { id: "customer_brain", name: "Customer Brain", description: "Perfil y preferencias de clientes" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  agent?: string;
}

export default function ChatPage() {
  const [selectedAgent, setSelectedAgent] = useState("director");
  const [clientName, setClientName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://lmtm.onrender.com/ask", {
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
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-1px)] flex">
      {/* Agent sidebar */}
      <div className="w-72 bg-white border-r p-4 overflow-y-auto">
        <h2 className="font-semibold mb-4">Agentes</h2>
        <div className="space-y-2">
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedAgent === agent.id
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="font-medium text-sm">{agent.name}</div>
              <div className="text-xs text-slate-500 line-clamp-1">
                {agent.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Chat con Agentes</h1>
            <p className="text-sm text-slate-500">
              Agente activo: <span className="font-medium">{AGENTS.find((a) => a.id === selectedAgent)?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nombre del cliente (opcional)"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 mt-20">
              <p className="text-4xl mb-4">💬</p>
              <p>Envía un mensaje para comenzar a chatear con el agente</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xl rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white border shadow-sm"
                }`}
              >
                {msg.role === "assistant" && msg.agent && (
                  <div className="text-xs text-slate-400 mb-1">
                    🤖 {msg.agent}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}