import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LMTM Panel - Agency OS",
  description: "Panel de gestión para LMTM Agency OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-900 text-white p-4">
            <div className="mb-8">
              <h1 className="text-xl font-bold">LMTM</h1>
              <p className="text-xs text-slate-400">Agency OS</p>
            </div>
            <nav className="space-y-2">
              <NavLink href="/" icon="📊">Dashboard</NavLink>
              <NavLink href="/chat" icon="💬">Chat Agentes</NavLink>
              <NavLink href="/projects" icon="📁">Proyectos</NavLink>
              <NavLink href="/goals" icon="🎯">Goals</NavLink>
            </nav>
            <div className="mt-8 pt-8 border-t border-slate-700">
              <div className="text-xs text-slate-400 mb-2">Backend API</div>
              <div className="text-sm bg-slate-800 rounded p-2">
                <a href="https://lmtm.onrender.com/docs" target="_blank" className="text-blue-400 hover:underline">
                  lmtm.onrender.com
                </a>
              </div>
            </div>
          </aside>
          {/* Main content */}
          <main className="flex-1 bg-slate-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
    >
      <span>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}