"use client";

import { useState, useEffect } from "react";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: "revenue" | "clients" | "operations" | "marketing";
  progress: number;
  target_date: string;
  status: "on_track" | "at_risk" | "completed" | "delayed";
  created_at: string;
}

const CATEGORIES = {
  revenue: { label: "Revenue", color: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/30", icon: "💰" },
  clients: { label: "Clientes", color: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/30", icon: "👥" },
  operations: { label: "Operaciones", color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/30", icon: "⚙️" },
  marketing: { label: "Marketing", color: "from-amber-500/20 to-amber-600/10", border: "border-amber-500/30", icon: "📢" },
};

const STATUS_CONFIG = {
  on_track: { label: "En curso", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  at_risk: { label: "En riesgo", color: "text-amber-400", bg: "bg-amber-400/10" },
  completed: { label: "Completado", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  delayed: { label: "Retrasado", color: "text-red-400", bg: "bg-red-400/10" },
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "revenue" as Goal["category"],
    progress: 0,
    target_date: "",
  });

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("lmtm_goals");
    if (stored) {
      setGoals(JSON.parse(stored));
    } else {
      const demo: Goal[] = [
        {
          id: "1",
          title: "Lanzar dashboard para 20 clientes",
          description: "Desplegar dashboards auto-actualizables para los primeros 20 clientes del agency",
          category: "operations",
          progress: 65,
          target_date: "2026-05-31",
          status: "on_track",
          created_at: "2026-05-01",
        },
        {
          id: "2",
          title: "$50,000 MRR",
          description: "Alcanzar $50,000 USD de ingresos recurrentes mensuales",
          category: "revenue",
          progress: 40,
          target_date: "2026-12-31",
          status: "at_risk",
          created_at: "2026-01-01",
        },
        {
          id: "3",
          title: "10 clientes nuevos con CRM",
          description: "Vender e implementar el CRM con agentes IA a 10 clientes nuevos",
          category: "clients",
          progress: 30,
          target_date: "2026-06-30",
          status: "on_track",
          created_at: "2026-04-01",
        },
        {
          id: "4",
          title: "Lanzar campaña Meta Q2",
          description: "Ejecutar campañas de ads para 5 clientes del sector real estate",
          category: "marketing",
          progress: 80,
          target_date: "2026-06-15",
          status: "on_track",
          created_at: "2026-04-15",
        },
      ];
      setGoals(demo);
    }
  }, []);

  const saveGoals = (updated: Goal[]) => {
    setGoals(updated);
    localStorage.setItem("lmtm_goals", JSON.stringify(updated));
  };

  const addGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      category: form.category,
      progress: form.progress,
      target_date: form.target_date,
      status: "on_track",
      created_at: new Date().toISOString().split("T")[0],
    };
    saveGoals([...goals, newGoal]);
    setForm({ title: "", description: "", category: "revenue", progress: 0, target_date: "" });
    setShowForm(false);
  };

  const updateProgress = (id: string, progress: number) => {
    saveGoals(
      goals.map((g) => {
        if (g.id !== id) return g;
        let status: Goal["status"] = "on_track";
        if (progress >= 100) status = "completed";
        else if (progress > 75) status = "on_track";
        else if (progress > 25) status = "at_risk";
        else status = "delayed";
        return { ...g, progress, status };
      })
    );
  };

  const deleteGoal = (id: string) => {
    if (confirm("¿Eliminar esta meta?")) {
      saveGoals(goals.filter((g) => g.id !== id));
    }
  };

  const progressColor = (progress: number) => {
    if (progress >= 100) return "from-emerald-400 to-emerald-500";
    if (progress >= 50) return "from-cyan-400 to-cyan-500";
    return "from-amber-400 to-amber-500";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        :root {
          --accent: #00f0ff;
        }
        body {
          font-family: 'Outfit', sans-serif;
          background: #0a0a0f;
        }
        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
        @keyframes progress-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(0, 240, 255, 0.3); }
          50% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.5); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #12121a; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div className={`max-w-6xl mx-auto mb-8 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight mb-1">
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                Goals
              </span>
            </h1>
            <p className="text-white/40">Seguimiento de objetivos y metas del agency</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-semibold rounded-xl hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            + Nueva Meta
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={`max-w-6xl mx-auto grid grid-cols-4 gap-4 mb-8 transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {[
          { label: "Total", value: goals.length, icon: "🎯" },
          { label: "En curso", value: goals.filter(g => g.status === "on_track").length, icon: "⚡" },
          { label: "En riesgo", value: goals.filter(g => g.status === "at_risk").length, icon: "⚠️" },
          { label: "Completadas", value: goals.filter(g => g.status === "completed").length, icon: "✅" },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-[#12121a] border border-white/5 rounded-2xl p-4" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-display text-3xl font-bold">{stat.value}</div>
            <div className="text-sm text-white/40">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h2 className="font-display text-xl font-bold mb-6">Nueva Meta</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-white/60 mb-2">Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  placeholder="Ej: Alcanzar 100 clientes"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Goal["category"] })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400/50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="revenue">💰 Revenue</option>
                    <option value="clients">👥 Clientes</option>
                    <option value="operations">⚙️ Operaciones</option>
                    <option value="marketing">📢 Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Fecha objetivo</label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400/50 transition-colors text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addGoal}
                  disabled={!form.title || !form.target_date}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-semibold rounded-xl hover:from-cyan-400 hover:to-cyan-500 transition-all disabled:opacity-50"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="max-w-6xl mx-auto space-y-4">
        {goals.length === 0 ? (
          <div className="text-center text-white/40 mt-20">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-lg">No hay metas todavía</p>
            <p className="text-sm mt-1">Crea tu primera meta para comenzar</p>
          </div>
        ) : (
          goals.map((goal, index) => {
            const statusConfig = STATUS_CONFIG[goal.status];
            const categoryConfig = CATEGORIES[goal.category];
            return (
              <div
                key={goal.id}
                className={`bg-[#12121a] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group animate-slide-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryConfig.color} border ${categoryConfig.border} flex items-center justify-center text-lg`}>
                      {categoryConfig.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{goal.title}</h3>
                      <p className="text-sm text-white/50">{goal.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <span className="text-sm text-white/30 font-mono">{goal.target_date}</span>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/40">Progreso</span>
                      <span className="text-sm font-mono font-medium">{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${progressColor(goal.progress)} rounded-full transition-all duration-500`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                    className="w-32 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}