"use client";

import { useEffect, useState } from "react";
import { Plus, Target, Loader2, Check, Circle } from "lucide-react";
import { listGoals, createGoal, updateGoal, type Goal } from "../../lib/api";
import { useSession } from "../../lib/session";
import { cn } from "../../lib/utils";

const LEVELS: Goal["level"][] = ["company", "team", "project", "task"];
const STATUSES: Goal["status"][] = ["planned", "active", "completed", "cancelled"];

export default function GoalsPage() {
  const { loading, user } = useSession();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<Goal["level"]>("project");

  async function refresh() {
    setBusy(true);
    setError(null);
    try {
      const data = await listGoals();
      setGoals(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!loading && user) refresh();
  }, [loading, user]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        level,
      });
      setTitle("");
      setDescription("");
      setShowForm(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(goal: Goal) {
    const next: Goal["status"] = goal.status === "completed" ? "active" : "completed";
    try {
      await updateGoal(goal.id, { status: next });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading || !user) return null;

  return (
    <div className="h-full overflow-y-auto scrollbar-auto-hide">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
            <p className="text-sm text-muted-foreground">Objetivos SMART por company, team, project o task.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-3 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo goal</span>
          </button>
        </div>

        {showForm ? (
          <form onSubmit={onCreate} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <input
              autoFocus
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
            <textarea
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
            <div className="flex gap-2 items-center">
              <label className="text-xs text-muted-foreground">Nivel:</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Goal["level"])}
                className="h-8 px-2 text-xs bg-secondary border border-input rounded-md"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 h-9 text-sm text-muted-foreground">Cancelar</button>
              <button type="submit" disabled={busy} className="px-3 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50">Crear</button>
            </div>
          </form>
        ) : null}

        {error ? <p className="text-xs text-red-400">{error}</p> : null}

        {busy && goals.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aún no hay goals. Creá el primero.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {goals.map((g) => (
              <div key={g.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggleStatus(g)}
                  className={cn(
                    "h-5 w-5 rounded-full border flex items-center justify-center shrink-0",
                    g.status === "completed"
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-muted-foreground text-muted-foreground hover:border-foreground",
                  )}
                >
                  {g.status === "completed" ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium truncate", g.status === "completed" && "line-through text-muted-foreground")}>{g.title}</p>
                  {g.description ? (
                    <p className="text-xs text-muted-foreground truncate">{g.description}</p>
                  ) : null}
                </div>
                <span className="text-[10px] uppercase text-muted-foreground bg-secondary px-2 py-0.5 rounded shrink-0">{g.level}</span>
                <span className="text-xs text-muted-foreground shrink-0">{g.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
