"use client";

import { useState, useEffect } from "react";

interface Project {
  id: string;
  name: string;
  client: string;
  status: "active" | "paused" | "completed";
  description: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lmtm.onrender.com";

function StatusBadge({ status }: { status: "active" | "paused" | "completed" }) {
  const config = {
    active: { label: "Activo", color: "text-emerald-400", bg: "bg-emerald-400/10", dot: "bg-emerald-400" },
    paused: { label: "Pausado", color: "text-amber-400", bg: "bg-amber-400/10", dot: "bg-amber-400" },
    completed: { label: "Completado", color: "text-cyan-400", bg: "bg-cyan-400/10", dot: "bg-cyan-400" },
  };
  const { label, color, bg, dot } = config[status];
  return (
    <span className={`${bg} ${color} text-xs px-3 py-1 rounded-full font-medium inline-flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    client: "",
    description: "",
  });

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("lmtm_projects");
    if (stored) {
      setProjects(JSON.parse(stored));
    } else {
      const demo: Project[] = [
        {
          id: "1",
          name: "Campaña Meta - Inmobiliaria Norte",
          client: "Inmobiliaria Norte",
          status: "active",
          description: "Ads en Meta para promoción de departamentos en preventa",
          created_at: "2026-05-01",
        },
        {
          id: "2",
          name: "Branding - Hotel Plaza",
          client: "Hotel Plaza",
          status: "active",
          description: "Rebranding completo y estrategia digital para temporada alta",
          created_at: "2026-04-15",
        },
        {
          id: "3",
          name: "CRM Implementation - TechStart",
          client: "TechStart",
          status: "completed",
          description: "Implementación de CRM con automatización de workflows",
          created_at: "2026-03-01",
        },
        {
          id: "4",
          name: "Google Ads - Clínica dental",
          client: "Clínica Sonrisa",
          status: "paused",
          description: "Campaña de ads para captación de pacientes nuevos",
          created_at: "2026-04-20",
        },
      ];
      setProjects(demo);
    }
  }, []);

  const saveProjects = (updated: Project[]) => {
    setProjects(updated);
    localStorage.setItem("lmtm_projects", JSON.stringify(updated));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: form.name,
      client: form.client,
      status: "active",
      description: form.description,
      created_at: new Date().toISOString().split("T")[0],
    };
    saveProjects([...projects, newProject]);
    setForm({ name: "", client: "", description: "" });
    setShowForm(false);
  };

  const deleteProject = (id: string) => {
    if (confirm("¿Eliminar este proyecto?")) {
      saveProjects(projects.filter((p) => p.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    saveProjects(
      projects.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "paused" : "active" }
          : p
      )
    );
  };

  const statusIcon = (status: string) => {
    if (status === "active") return "⚡";
    if (status === "paused") return "⏸️";
    return "✅";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        :root { --accent: #00f0ff; }
        body { font-family: 'Outfit', sans-serif; background: #0a0a0f; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
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
                Proyectos
              </span>
            </h1>
            <p className="text-white/40">Gestiona proyectos y clientes del agency</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-semibold rounded-xl hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            + Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={`max-w-6xl mx-auto grid grid-cols-4 gap-4 mb-8 transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {[
          { label: "Total", value: projects.length, icon: "📁" },
          { label: "Activos", value: projects.filter(p => p.status === "active").length, icon: "⚡" },
          { label: "Pausados", value: projects.filter(p => p.status === "paused").length, icon: "⏸️" },
          { label: "Completados", value: projects.filter(p => p.status === "completed").length, icon: "✅" },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-[#12121a] border border-white/5 rounded-2xl p-4 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
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
            <h2 className="font-display text-xl font-bold mb-6">Nuevo Proyecto</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-white/60 mb-2">Nombre del proyecto</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  placeholder="Ej: Campaña Meta Q2"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Cliente</label>
                <input
                  type="text"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  placeholder="Ej: Inmobiliaria Norte"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
                  rows={3}
                  placeholder="Descripción del proyecto..."
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addProject}
                  disabled={!form.name || !form.client}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-semibold rounded-xl hover:from-cyan-400 hover:to-cyan-500 transition-all disabled:opacity-50"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="max-w-6xl mx-auto">
        {projects.length === 0 ? (
          <div className="text-center text-white/40 mt-20">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-lg">No hay proyectos todavía</p>
            <p className="text-sm mt-1">Crea tu primer proyecto para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="bg-[#12121a] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <StatusBadge status={project.status} />
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="w-8 h-8 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all flex items-center justify-center"
                  >
                    🗑️
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 border border-cyan-400/20 flex items-center justify-center text-lg">
                    {statusIcon(project.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{project.name}</h3>
                    <p className="text-sm text-white/50">{project.client}</p>
                  </div>
                </div>

                <p className="text-sm text-white/40 line-clamp-2 mb-4 min-h-[2.5rem]">
                  {project.description || "Sin descripción"}
                </p>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-white/30 font-mono">
                    {project.created_at}
                  </span>
                  <button
                    onClick={() => toggleStatus(project.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      project.status === "active"
                        ? "bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
                        : "bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                    }`}
                  >
                    {project.status === "active" ? "Pausar" : "Activar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}