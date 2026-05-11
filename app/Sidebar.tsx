"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "■", label: "Home" },
  { href: "/chat", icon: "●", label: "Chat" },
  { href: "/projects", icon: "▲", label: "Projects" },
  { href: "/goals", icon: "◎", label: "Goals" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed h-full w-64 flex flex-col"
      style={{
        background: "linear-gradient(180deg, #1a1716 0%, #0f0d0d 100%)",
        borderRight: "1px solid rgba(255, 255, 255, 0.06)"
      }}
    >
      {/* Logo Area */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{
              background: "linear-gradient(135deg, #e85d04 0%, #dc2f02 100%)",
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: "0.05em"
            }}
          >
            LM
          </div>
          <div>
            <h1
              className="text-2xl tracking-wider"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#faf8f5" }}
            >
              LMTM
            </h1>
            <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(250,248,245,0.4)" }}>
              Agency OS
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <p
          className="text-[10px] tracking-[0.2em] uppercase px-3 mb-4"
          style={{ color: "rgba(250,248,245,0.3)" }}
        >
          Navigation
        </p>
        <div className="space-y-1">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 rounded-lg transition-all duration-200 relative group"
                style={{
                  animation: `slideInLeft 0.3s ease-out ${i * 50}ms both`
                }}
              >
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: "linear-gradient(90deg, rgba(232,93,4,0.15) 0%, rgba(220,47,2,0.05) 100%)",
                      border: "1px solid rgba(232,93,4,0.3)"
                    }}
                  />
                )}
                <div className="relative flex items-center gap-4">
                  <span
                    className="text-lg transition-colors"
                    style={{
                      color: isActive ? "#e85d04" : "rgba(250,248,245,0.4)",
                      fontSize: "18px"
                    }}
                  >
                    {item.icon}
                  </span>
                  <span
                    className="text-sm font-medium tracking-wide transition-colors"
                    style={{
                      color: isActive ? "#faf8f5" : "rgba(250,248,245,0.5)"
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div
          className="rounded-lg p-4 mb-3"
          style={{ background: "rgba(232,93,4,0.08)", border: "1px solid rgba(232,93,4,0.2)" }}
        >
          <p className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: "rgba(250,248,245,0.4)" }}>
            Backend API
          </p>
          <a
            href="https://lmtm.onrender.com/docs"
            target="_blank"
            style={{
              color: "#e85d04",
              fontSize: "12px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            lmtm.onrender.com ↗
          </a>
        </div>
        <div
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
          style={{ color: "rgba(250,248,245,0.4)" }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#4ade80" }}
          />
          All systems operational
        </div>
      </div>
    </aside>
  );
}