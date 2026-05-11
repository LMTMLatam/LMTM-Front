import Link from "next/link";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-slate-500 mb-8">Panel de control de LMTM Agency OS</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Chat con Agentes"
          description="Interactúa con todos los agentes IA de la agencia"
          href="/chat"
          icon="💬"
          color="bg-blue-500"
        />
        <DashboardCard
          title="Proyectos"
          description="Gestiona proyectos y clientes"
          href="/projects"
          icon="📁"
          color="bg-emerald-500"
        />
        <DashboardCard
          title="Goals"
          description="Seguimiento de objetivos y metas"
          href="/goals"
          icon="🎯"
          color="bg-amber-500"
        />
        <DashboardCard
          title="Dashboard API"
          description="Documentación de la API REST"
          href="https://lmtm.onrender.com/docs"
          icon="📡"
          color="bg-purple-500"
          external
        />
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Estado de Servicios</h2>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">Backend API</div>
              <div className="text-sm text-slate-500">https://lmtm.onrender.com</div>
            </div>
            <StatusBadge status="online" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Panel Web</div>
              <div className="text-sm text-slate-500">Este panel</div>
            </div>
            <StatusBadge status="online" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  icon,
  color,
  external = false,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  external?: boolean;
}) {
  const content = (
    <div className={`${color} text-white rounded-xl p-6 h-full`}>
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={href}>{content}</Link>;
}

function StatusBadge({ status }: { status: "online" | "offline" }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
      status === "online" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
    }`}>
      {status === "online" ? "● Online" : "○ Offline"}
    </span>
  );
}