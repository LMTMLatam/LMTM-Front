"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "◈", label: "Dashboard" },
  { href: "/chat", icon: "◉", label: "Chat Agentes" },
  { href: "/projects", icon: "◇", label: "Proyectos" },
  { href: "/goals", icon: "○", label: "Goals" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d0d12] border-r border-white/5 flex flex-col fixed h-full">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-sm">LM</span>
          </div>
          <div>
            <h1 className="font-semibold tracking-tight text-white">LMTM</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Agency OS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <p className="text-[10px] text-white/20 uppercase tracking-widest px-3 mb-3">Navegación</p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className={`text-lg transition-colors ${isActive ? "text-indigo-400" : "text-white/30 group-hover:text-white/50"}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-3 border border-white/5">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Backend</p>
          <a
            href="https://lmtm.onrender.com/docs"
            target="_blank"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            lmtm.onrender.com
            <span className="text-[10px]">↗</span>
          </a>
        </div>
        <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sistema activo
          </div>
        </div>
      </div>
    </aside>
  );
}