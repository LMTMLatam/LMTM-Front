import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./Sidebar";

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
      <body>
        <div className="flex min-h-screen" style={{ background: "#0f0d0d" }}>
          <Sidebar />
          <main
            className="flex-1 overflow-auto"
            style={{ marginLeft: "256px", padding: "48px" }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}