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
  revenue: { label: "💰 Revenue", color: "bg-emerald-500" },
  clients: { label: "👥 Clientes", color: "bg-blue-500" },
  operations: { label: "⚙️ Operaciones", color: "bg-purple-500" },
  marketing: { label: "📢 Marketing", color: "bg-amber-500" },
};

const STATUS_CONFIG = {
  on_track: { bg: "bg-emerald-100", text: "text-emerald-700", label: "En curso" },
  at_risk: { bg: "bg-amber-100", text: "text-amber-700", label: "En riesgo" },
  completed: { bg: "bg-blue-100", text: "text-blue-700", label: "Completado" },
  delayed: { bg: "bg-red-100", text: "text-red-700", label: "Retrasado" },
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "revenue" as Goal["category"],
    progress: 0,
    target_date: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("lmtm_goals");
    if (stored) {
      setGoals(JSON.parse(stored));
    } else {
      const demo = [
        {
          id: "1",
          title: "Lanzar dashboard para 20 clientes",
          description: "Desplegar dashboards auto-actualizables para los primeros 20 clientes",
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-slate-500">Seguimiento de objetivos y metas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          + Nueva Meta
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva Meta</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Alcanzar 100 clientes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Goal["category"] })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="clients">Clientes</option>
                    <option value="operations">Operaciones</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha objetivo</label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={addGoal}
                  disabled={!form.title || !form.target_date}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="text-center text-slate-400 mt-20">
          <p className="text-4xl mb-4">🎯</p>
          <p>No hay metas todavía</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const statusConfig = STATUS_CONFIG[goal.status];
            const categoryConfig = CATEGORIES[goal.category];
            return (
              <div key={goal.id} className="bg-white rounded-xl border shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`${categoryConfig.color} text-white text-xs px-2 py-1 rounded-full`}>
                      {categoryConfig.label}
                    </span>
                    <span className={`${statusConfig.bg} ${statusConfig.text} text-xs px-2 py-1 rounded-full font-medium`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{goal.target_date}</span>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1">{goal.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{goal.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-500">Progreso</span>
                      <span className="text-sm font-medium">{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          goal.progress >= 100 ? "bg-emerald-500" :
                          goal.progress >= 50 ? "bg-blue-500" : "bg-amber-500"
                        }`}
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
                    className="w-32"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}