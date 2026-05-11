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

const API_URL = "https://lmtm.onrender.com";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    client: "",
    description: "",
  });

  useEffect(() => {
    // Load from localStorage for now (later: Supabase)
    const stored = localStorage.getItem("lmtm_projects");
    if (stored) {
      setProjects(JSON.parse(stored));
    } else {
      // Demo data
      const demo = [
        {
          id: "1",
          name: "Campaña Meta - Inmobiliaria Norte",
          client: "Inmobiliaria Norte",
          status: "active",
          description: "Ads en Meta para promoción de departamentos",
          created_at: "2026-05-01",
        },
        {
          id: "2",
          name: "Branding - Hotel Plaza",
          client: "Hotel Plaza",
          status: "active",
          description: "Rebranding completo y estrategia digital",
          created_at: "2026-04-15",
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Proyectos</h1>
          <p className="text-slate-500">Gestiona proyectos y clientes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          + Nuevo Proyecto
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Proyecto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del proyecto</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Campaña Meta Q2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cliente</label>
                <input
                  type="text"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Inmobiliaria Norte"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Descripción del proyecto..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={addProject}
                  disabled={!form.name || !form.client}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div className="text-center text-slate-400 mt-20">
          <p className="text-4xl mb-4">📁</p>
          <p>No hay proyectos todavía</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <StatusBadge status={project.status} />
                </div>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  🗑️
                </button>
              </div>
              <h3 className="font-semibold mb-1">{project.name}</h3>
              <p className="text-sm text-slate-500 mb-2">{project.client}</p>
              <p className="text-sm text-slate-600 line-clamp-2">
                {project.description || "Sin descripción"}
              </p>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Creado: {project.created_at}
                </span>
                <button
                  onClick={() => toggleStatus(project.id)}
                  className={`text-xs px-2 py-1 rounded ${
                    project.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
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
  );
}

function StatusBadge({ status }: { status: "active" | "paused" | "completed" }) {
  const config = {
    active: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Activo" },
    paused: { bg: "bg-amber-100", text: "text-amber-700", label: "Pausado" },
    completed: { bg: "bg-slate-100", text: "text-slate-600", label: "Completado" },
  };
  const { bg, text, label } = config[status];
  return (
    <span className={`${bg} ${text} text-xs px-2 py-1 rounded-full font-medium`}>
      {label}
    </span>
  );
}