"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            LMTM Agency OS
          </span>
        </h1>
        <p className="text-white/40 text-lg">Panel de control y gestión inteligente</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { label: "Proyectos activos", value: "12", icon: "◈", color: "from-indigo-500/20 to-indigo-600/10" },
          { label: "Metas en curso", value: "8", icon: "○", color: "from-purple-500/20 to-purple-600/10" },
          { label: "Clientes", value: "24", icon: "◇", color: "from-pink-500/20 to-pink-600/10" },
          { label: "Mensajes hoy", value: "156", icon: "◉", color: "from-cyan-500/20 to-cyan-600/10" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border border-white/5 rounded-2xl p-5`}>
            <div className="text-2xl mb-2 text-white/40">{stat.icon}</div>
            <div className="font-display text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs text-white/40">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Navigation Cards */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <Link
          href="/chat"
          className="group relative overflow-hidden bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 border border-white/10 rounded-3xl p-8 h-48 hover:border-indigo-500/30 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/30 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="text-4xl mb-4">◉</div>
          <h3 className="font-display text-xl font-semibold text-white mb-2">Chat con Agentes</h3>
          <p className="text-sm text-white/50">Interactúa con los agentes IA de la agencia</p>
          <div className="absolute bottom-4 right-4 text-2xl text-white/20 group-hover:text-indigo-400 transition-colors">→</div>
        </Link>

        <Link
          href="/projects"
          className="group relative overflow-hidden bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-purple-500/20 border border-white/10 rounded-3xl p-8 h-48 hover:border-purple-500/30 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="text-4xl mb-4">◇</div>
          <h3 className="font-display text-xl font-semibold text-white mb-2">Proyectos</h3>
          <p className="text-sm text-white/50">Gestiona proyectos y clientes activos</p>
          <div className="absolute bottom-4 right-4 text-2xl text-white/20 group-hover:text-purple-400 transition-colors">→</div>
        </Link>

        <Link
          href="/goals"
          className="group relative overflow-hidden bg-gradient-to-br from-pink-500/20 via-cyan-500/10 to-pink-500/20 border border-white/10 rounded-3xl p-8 h-48 hover:border-pink-500/30 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/30 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="text-4xl mb-4">○</div>
          <h3 className="font-display text-xl font-semibold text-white mb-2">Goals</h3>
          <p className="text-sm text-white/50">Seguimiento de objetivos y metas</p>
          <div className="absolute bottom-4 right-4 text-2xl text-white/20 group-hover:text-pink-400 transition-colors">→</div>
        </Link>
      </div>

      {/* Status Section */}
      <div>
        <h2 className="font-display text-lg font-semibold text-white/80 mb-4">Estado de Servicios</h2>
        <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <div className="font-medium text-white mb-1">Backend API</div>
                <div className="text-xs text-white/30 font-mono">https://lmtm.onrender.com</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <div className="font-medium text-white mb-1">Panel Web</div>
                <div className="text-xs text-white/30 font-mono">Este panel</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <div className="font-medium text-white mb-1">MiniMax LLM</div>
                <div className="text-xs text-white/30 font-mono">Modelo activo</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-xs text-indigo-400 font-medium">Activo</span>
              </div>
            </div>
            <a
              href="https://lmtm.onrender.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors group"
            >
              <div>
                <div className="font-medium text-white mb-1">API Docs</div>
                <div className="text-xs text-white/30 font-mono">Swagger UI</div>
              </div>
              <div className="flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <span className="text-xs">Abrir</span>
                <span>↗</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}