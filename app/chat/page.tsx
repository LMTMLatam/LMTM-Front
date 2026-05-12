"use client";

import { useState } from "react";
import { sendMessage } from "../../lib/api";
import { cn } from "../../lib/utils";
import { Bot, Send, Circle, User, Clock } from "lucide-react";

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
  id: number;
  role: "user" | "assistant";
  content: string;
  agent?: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [selectedAgent, setSelectedAgent] = useState("director");
  const [clientName, setClientName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const currentAgent = AGENTS.find((a) => a.id === selectedAgent);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setInitialized(true);

    try {
      const response = await sendMessage(input, selectedAgent, clientName || undefined);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.output || "Sin respuesta",
        agent: response.agent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Error: ${error}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex">
      {/* Agent List Sidebar */}
      <div className="w-64 border-r border-border bg-card shrink-0 flex flex-col">
        <div className="p-3 border-b border-border">
          <h2 className="text-sm font-semibold">Agents</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 scrollbar-auto-hide">
          <div className="space-y-0.5">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  selectedAgent === agent.id
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{agent.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {agent.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 px-4 flex items-center gap-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-muted-foreground" />
            <div>
              <h1 className="text-sm font-semibold">{currentAgent?.name}</h1>
              <p className="text-xs text-muted-foreground">{currentAgent?.description}</p>
            </div>
          </div>
          <div className="flex-1" />
          <input
            type="text"
            placeholder="Client name (optional)"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="h-8 w-40 px-3 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-auto-hide">
          {!initialized ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">Chat with {currentAgent?.name}</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Send a message to start chatting with this agent. You can optionally specify a client
                for context.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 px-4 py-4",
                    message.role === "user" ? "bg-accent/30" : "bg-card"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.role === "user" ? "You" : message.agent || "Agent"}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 px-4 py-4 bg-card">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Circle className="h-2 w-2 animate-pulse text-muted-foreground" />
                    <Circle className="h-2 w-2 animate-pulse text-muted-foreground [animation-delay:150ms]" />
                    <Circle className="h-2 w-2 animate-pulse text-muted-foreground [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 h-10 px-4 text-sm bg-secondary border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}