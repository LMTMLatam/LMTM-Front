"use client";

import { useState, useEffect } from "react";
import { Plus, FolderKanban, Circle, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface Project {
  id: string;
  name: string;
  client: string;
  status: "active" | "paused" | "completed";
  description: string;
  created_at: string;
}

const statusConfig = {
  active: { label: "Active", color: "bg-green-500", text: "text-green-600", bg: "bg-green-500/10" },
  paused: { label: "Paused", color: "bg-yellow-500", text: "text-yellow-600", bg: "bg-yellow-500/10" },
  completed: { label: "Completed", color: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-muted/10" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", client: "", description: "" });

  useEffect(() => {
    const stored = localStorage.getItem("lmtm_projects");
    if (stored) {
      setProjects(JSON.parse(stored));
    } else {
      setProjects([
        { id: "1", name: "Campaña Meta - Inmobiliaria Norte", client: "Inmobiliaria Norte", status: "active", description: "Ads en Meta para promoción de departamentos", created_at: "2026-05-01" },
        { id: "2", name: "Branding - Hotel Plaza", client: "Hotel Plaza", status: "active", description: "Rebranding completo y estrategia digital", created_at: "2026-04-15" },
        { id: "3", name: "CRM Implementation - TechStart", client: "TechStart", status: "completed", description: "Implementación de CRM con automatización", created_at: "2026-03-01" },
      ]);
    }
  }, []);

  const saveProjects = (updated: Project[]) => {
    setProjects(updated);
    localStorage.setItem("lmtm_projects", JSON.stringify(updated));
  };

  const addProject = () => {
    if (!form.name || !form.client) return;
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
    if (confirm("Delete this project?")) {
      saveProjects(projects.filter((p) => p.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    saveProjects(
      projects.map((p) =>
        p.id === id ? { ...p, status: p.status === "active" ? "paused" : "active" } : p
      )
    );
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-auto-hide">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">{projects.length} total projects</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-4">New Project</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Project name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Client</label>
                  <input
                    type="text"
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full h-20 px-3 text-sm bg-secondary border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    placeholder="Project description"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowForm(false)} className="h-9 px-4 text-sm font-medium hover:bg-accent rounded-md">Cancel</button>
                  <button onClick={addProject} disabled={!form.name || !form.client} className="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md disabled:opacity-50">Create</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="bg-card rounded-lg border border-border divide-y divide-border">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderKanban className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">No projects yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first project to get started</p>
            </div>
          ) : (
            projects.map((project) => {
              const status = statusConfig[project.status];
              return (
                <div key={project.id} className="flex items-center gap-4 px-4 py-3 first:rounded-t-lg last:rounded-b-lg hover:bg-accent/50 transition-colors group">
                  <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <FolderKanban className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", status.bg, status.text)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{project.client}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleStatus(project.id)} className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground" title={project.status === "active" ? "Pause" : "Activate"}>
                      <Circle className="h-3 w-3 fill-current" />
                    </button>
                    <button onClick={() => deleteProject(project.id)} className="h-8 w-8 rounded-md hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
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