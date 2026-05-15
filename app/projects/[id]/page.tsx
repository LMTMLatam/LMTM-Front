"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { deleteProject, getProject, listAgents, type Agent, type Project } from "../../../lib/api";
import { useSession } from "../../../lib/session";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, user } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user || !id) return;
    setBusy(true);
    Promise.all([getProject(id), listAgents()])
      .then(([p, a]) => {
        setProject(p);
        setAgents(a);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setBusy(false));
  }, [id, loading, user]);

  async function onDelete() {
    if (!project) return;
    if (!confirm(`¿Eliminar proyecto "${project.name}"?`)) return;
    try {
      await deleteProject(project.id);
      router.replace("/projects");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading || !user) return null;

  return (
    <div className="h-full overflow-y-auto scrollbar-auto-hide">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>

        {busy ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando proyecto…
          </div>
        ) : null}

        {error ? <p className="text-xs text-red-400">{error}</p> : null}

        {project ? (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold">{project.name}</h1>
                {project.description ? (
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                ) : null}
              </div>
              <button
                onClick={onDelete}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            </div>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold">Equipo de agentes</h2>
              {agents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aún no hay agentes. Crealos desde la pestaña <a href="/agents" className="underline">Agents</a>.
                </p>
              ) : (
                <div className="bg-card border border-border rounded-lg divide-y divide-border">
                  {agents.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.role} · {a.adapterType}
                          {a.title ? ` · ${a.title}` : ""}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold">Detalles</h2>
              <div className="bg-card border border-border rounded-lg p-4 text-xs space-y-2 font-mono">
                <KV k="id" v={project.id} />
                <KV k="status" v={project.status ?? "—"} />
                <KV k="createdAt" v={new Date(project.createdAt).toLocaleString()} />
                <KV k="updatedAt" v={new Date(project.updatedAt).toLocaleString()} />
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-muted-foreground w-24">{k}</span>
      <span className="truncate">{v}</span>
    </div>
  );
}
