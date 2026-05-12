"use client";

import { useState, useEffect } from "react";
import { Plus, Target, Circle, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

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

const categoryConfig = {
  revenue: { label: "Revenue", bg: "bg-green-500/10", text: "text-green-600", icon: "💰" },
  clients: { label: "Clients", bg: "bg-blue-500/10", text: "text-blue-600", icon: "👥" },
  operations: { label: "Operations", bg: "bg-purple-500/10", text: "text-purple-600", icon: "⚙️" },
  marketing: { label: "Marketing", bg: "bg-amber-500/10", text: "text-amber-600", icon: "📢" },
};

const statusConfig = {
  on_track: { label: "On Track", color: "bg-green-500", text: "text-green-600" },
  at_risk: { label: "At Risk", color: "bg-yellow-500", text: "text-yellow-600" },
  completed: { label: "Completed", color: "bg-muted-foreground", text: "text-muted-foreground" },
  delayed: { label: "Delayed", color: "bg-red-500", text: "text-red-600" },
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "revenue" as Goal["category"],
    target_date: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("lmtm_goals");
    if (stored) {
      setGoals(JSON.parse(stored));
    } else {
      setGoals([
        { id: "1", title: "Lanzar dashboard para 20 clientes", description: "Desplegar dashboards auto-actualizables", category: "operations", progress: 65, target_date: "2026-05-31", status: "on_track", created_at: "2026-05-01" },
        { id: "2", title: "$50,000 MRR", description: "Alcanzar $50,000 USD MRR", category: "revenue", progress: 40, target_date: "2026-12-31", status: "at_risk", created_at: "2026-01-01" },
        { id: "3", title: "10 clientes nuevos con CRM", description: "Vender e implementar CRM con agentes IA", category: "clients", progress: 30, target_date: "2026-06-30", status: "on_track", created_at: "2026-04-01" },
      ]);
    }
  }, []);

  const saveGoals = (updated: Goal[]) => {
    setGoals(updated);
    localStorage.setItem("lmtm_goals", JSON.stringify(updated));
  };

  const addGoal = () => {
    if (!form.title || !form.target_date) return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      category: form.category,
      progress: 0,
      target_date: form.target_date,
      status: "on_track",
      created_at: new Date().toISOString().split("T")[0],
    };
    saveGoals([...goals, newGoal]);
    setForm({ title: "", description: "", category: "revenue", target_date: "" });
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
    if (confirm("Delete this goal?")) {
      saveGoals(goals.filter((g) => g.id !== id));
    }
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-auto-hide">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
            <p className="text-sm text-muted-foreground">{goals.length} active goals</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Goal</span>
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-4">New Goal</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Goal title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Goal["category"] })}
                    className="w-full h-10 px-3 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="revenue">💰 Revenue</option>
                    <option value="clients">👥 Clients</option>
                    <option value="operations">⚙️ Operations</option>
                    <option value="marketing">📢 Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Target Date</label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full h-20 px-3 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    placeholder="Goal description"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowForm(false)} className="h-9 px-4 text-sm font-medium hover:bg-accent rounded-md">Cancel</button>
                  <button onClick={addGoal} disabled={!form.title || !form.target_date} className="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md disabled:opacity-50">Create</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-lg border border-border">
              <Target className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">No goals yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first goal to start tracking</p>
            </div>
          ) : (
            goals.map((goal) => {
              const category = categoryConfig[goal.category];
              const status = statusConfig[goal.status];
              return (
                <div key={goal.id} className="bg-card rounded-lg border border-border p-4 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-md flex items-center justify-center text-lg", category.bg)}>
                        {category.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{goal.title}</p>
                        <p className="text-xs text-muted-foreground">{goal.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", category.bg, category.text)}>
                        {category.label}
                      </span>
                      <button onClick={() => deleteGoal(goal.id)} className="h-8 w-8 rounded-md hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium">{goal.progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", goal.progress >= 100 ? "bg-green-500" : goal.progress >= 50 ? "bg-blue-500" : "bg-amber-500")}
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
                      className="w-28 accent-foreground"
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                    <span>Target: {goal.target_date}</span>
                    <span className={cn("flex items-center gap-1", status.text)}>
                      <Circle className={cn("h-2 w-2 fill-current")} />
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}