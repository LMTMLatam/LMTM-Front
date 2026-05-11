"use client";

import Link from "next/link";

const navCards = [
  {
    href: "/chat",
    title: "CHAT",
    subtitle: "Con agentes IA",
    icon: "●",
    accent: "#e85d04",
    bg: "linear-gradient(135deg, rgba(232,93,4,0.12) 0%, rgba(220,47,2,0.06) 100%)",
    border: "rgba(232,93,4,0.2)"
  },
  {
    href: "/projects",
    title: "PROJECTS",
    subtitle: "Gestión integral",
    icon: "▲",
    accent: "#dc2f02",
    bg: "linear-gradient(135deg, rgba(220,47,2,0.12) 0%, rgba(124,29,29,0.06) 100%)",
    border: "rgba(220,47,2,0.2)"
  },
  {
    href: "/goals",
    title: "GOALS",
    subtitle: "Tracking de metas",
    icon: "◎",
    accent: "#f48c06",
    bg: "linear-gradient(135deg, rgba(244,140,6,0.12) 0%, rgba(232,93,4,0.06) 100%)",
    border: "rgba(244,140,6,0.2)"
  }
];

const stats = [
  { label: "Active Projects", value: "24", trend: "+3 this month" },
  { label: "Goals On Track", value: "18", trend: "78% completion" },
  { label: "AI Conversations", value: "1,429", trend: "Today: 47" },
  { label: "Uptime", value: "99.9%", trend: "Last 30 days" }
];

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Header */}
      <header className="mb-16">
        <div className="mb-2">
          <span
            className="text-[11px] tracking-[0.4em] uppercase"
            style={{ color: "rgba(250,248,245,0.4)" }}
          >
            Agency Operating System
          </span>
        </div>
        <h1
          className="text-7xl mb-4"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: "0.03em",
            lineHeight: 0.95
          }}
        >
          LMTM
          <br />
          <span style={{ color: "#e85d04" }}>PANEL</span>
        </h1>
        <p className="text-lg max-w-xl" style={{ color: "rgba(250,248,245,0.5)" }}>
          Central hub for managing AI agents, tracking projects, and monitoring agency performance.
        </p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-4 gap-4 mb-16">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl"
            style={{
              background: "#1a1716",
              border: "1px solid rgba(255,255,255,0.06)",
              animation: `fadeIn 0.4s ease-out ${i * 60}ms both`
            }}
          >
            <p
              className="text-[10px] tracking-[0.2em] uppercase mb-3"
              style={{ color: "rgba(250,248,245,0.35)" }}
            >
              {stat.label}
            </p>
            <p
              className="text-4xl mb-1"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: "0.02em",
                color: "#faf8f5"
              }}
            >
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: "rgba(250,248,245,0.4)" }}>
              {stat.trend}
            </p>
          </div>
        ))}
      </section>

      {/* Navigation Cards */}
      <section className="mb-16">
        <h2
          className="text-sm tracking-[0.2em] uppercase mb-6"
          style={{ color: "rgba(250,248,245,0.4)" }}
        >
          Quick Access
        </h2>
        <div className="grid grid-cols-3 gap-5">
          {navCards.map((card, i) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                animation: `fadeIn 0.5s ease-out ${i * 80}ms both`
              }}
            >
              {/* Decorative element */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: card.accent, transform: "translate(30%, -30%)" }}
              />

              <div className="relative">
                <span
                  className="text-3xl block mb-4 transition-transform group-hover:scale-110 duration-300"
                  style={{ color: card.accent }}
                >
                  {card.icon}
                </span>
                <h3
                  className="text-3xl mb-1"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}
                >
                  {card.title}
                </h3>
                <p className="text-sm" style={{ color: "rgba(250,248,245,0.5)" }}>
                  {card.subtitle}
                </p>
              </div>

              <div
                className="absolute bottom-4 right-4 text-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
                style={{ color: card.accent }}
              >
                →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* System Status */}
      <section>
        <h2
          className="text-sm tracking-[0.2em] uppercase mb-6"
          style={{ color: "rgba(250,248,245,0.4)" }}
        >
          System Status
        </h2>
        <div
          className="rounded-xl p-6"
          style={{
            background: "#1a1716",
            border: "1px solid rgba(255,255,255,0.06)"
          }}
        >
          <div className="grid grid-cols-2 gap-6">
            {[
              { name: "Backend API", url: "lmtm.onrender.com", status: "operational", color: "#4ade80" },
              { name: "MiniMax LLM", url: "AI Provider", status: "operational", color: "#4ade80" },
              { name: "Frontend", url: "vercel.app", status: "operational", color: "#4ade80" },
              { name: "API Docs", url: "Swagger UI", status: "available", color: "#e85d04" }
            ].map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: "#faf8f5" }}>
                    {service.name}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(250,248,245,0.35)" }}>
                    {service.url}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: service.color }}
                  />
                  <span className="text-xs capitalize" style={{ color: service.color }}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}