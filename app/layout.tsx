import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "../components/Sidebar";

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
    <html lang="es" className="dark">
      <body className="h-full">
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 min-h-0 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}