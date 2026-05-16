"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCcw, Trash2, ExternalLink, Link2 } from "lucide-react";
import {
  listAllMetaConnections,
  createMetaConnection,
  deleteMetaConnection,
  listMetaAdAccounts,
  listCompanies,
  listMetaMappings,
  createMetaMapping,
  deleteMetaMapping,
  metaOauthStartUrl,
  type GlobalMetaConnection,
  type MetaAdAccount,
  type MetaMapping,
  type Company,
} from "../../../lib/api";
import { useSession } from "../../../lib/session";

type ManualForm = {
  label: string;
  accessToken: string;
  tokenType: "system" | "user" | "page" | "app";
  businessId: string;
  pageId: string;
};

const EMPTY_FORM: ManualForm = {
  label: "",
  accessToken: "",
  tokenType: "system",
  businessId: "",
  pageId: "",
};

type MapForm = { companyId: string; connectionId: string; adAccountId: string; label: string };

export default function MetaIntegrationsPage() {
  const { loading, user } = useSession();
  const [conns, setConns] = useState<GlobalMetaConnection[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [mappingsByCompany, setMappingsByCompany] = useState<Record<string, MetaMapping[]>>({});
  const [adAccounts, setAdAccounts] = useState<Record<string, MetaAdAccount[]>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ManualForm>(EMPTY_FORM);
  const [probingId, setProbingId] = useState<string | null>(null);
  const [mapForm, setMapForm] = useState<MapForm>({
    companyId: "",
    connectionId: "",
    adAccountId: "",
    label: "",
  });

  async function refreshAll() {
    setBusy(true);
    setError(null);
    try {
      const [c, comps] = await Promise.all([listAllMetaConnections(), listCompanies()]);
      setConns(c);
      setCompanies(comps);
      // fetch mappings per company in parallel
      const entries = await Promise.all(
        comps.map(async (co) => {
          try {
            const m = await listMetaMappings(co.id);
            return [co.id, m] as const;
          } catch {
            return [co.id, [] as MetaMapping[]] as const;
          }
        }),
      );
      setMappingsByCompany(Object.fromEntries(entries));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!loading && user) refreshAll();
  }, [loading, user]);

  const adAccountsOfSelectedConn = useMemo(
    () => (mapForm.connectionId ? adAccounts[mapForm.connectionId] ?? [] : []),
    [mapForm.connectionId, adAccounts],
  );

  async function probeAccounts(connId: string) {
    setProbingId(connId);
    setError(null);
    try {
      const r = await listMetaAdAccounts(connId);
      setAdAccounts((p) => ({ ...p, [connId]: r.data }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setProbingId(null);
    }
  }

  async function onCreateConn(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim() || !form.accessToken.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createMetaConnection({
        label: form.label.trim(),
        accessToken: form.accessToken.trim(),
        tokenType: form.tokenType,
        businessId: form.businessId.trim() || undefined,
        pageId: form.pageId.trim() || undefined,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteConn(id: string) {
    if (!confirm("¿Borrar esta conexión? Se borran también sus mappings.")) return;
    setBusy(true);
    setError(null);
    try {
      await deleteMetaConnection(id);
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onCreateMapping(e: React.FormEvent) {
    e.preventDefault();
    if (!mapForm.companyId || !mapForm.connectionId || !mapForm.adAccountId.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createMetaMapping(
        {
          connectionId: mapForm.connectionId,
          adAccountId: mapForm.adAccountId.trim(),
          label: mapForm.label.trim() || undefined,
        },
        mapForm.companyId,
      );
      setMapForm({ companyId: "", connectionId: "", adAccountId: "", label: "" });
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteMapping(id: string) {
    if (!confirm("¿Borrar este mapping?")) return;
    setBusy(true);
    setError(null);
    try {
      await deleteMetaMapping(id);
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="h-full overflow-y-auto scrollbar-auto-hide">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meta (Facebook / Instagram)</h1>
          <p className="text-sm text-muted-foreground">
            Una conexión con tu cuenta de Facebook accede a todos los ad accounts que administrás.
            Después asignás cada ad account al cliente que corresponda.
          </p>
        </div>

        {error ? <p className="text-xs text-red-400">{error}</p> : null}

        {/* SECTION 1: Mi cuenta Meta */}
        <section className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">1. Mi cuenta Meta</h2>
              <p className="text-xs text-muted-foreground">
                Conectá tu cuenta (la que administra las páginas de tus clientes).
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={metaOauthStartUrl("Mi cuenta FB")}
                className="flex items-center gap-2 px-3 h-9 bg-secondary border border-input rounded-md text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4" /> OAuth
              </a>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-2 px-3 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Token manual
              </button>
            </div>
          </div>

          {showForm ? (
            <form onSubmit={onCreateConn} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Pegá un <b>System User token</b> de Business Manager para acceso sin expiración.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Label (ej: Cuenta principal LMTM)"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
                  required
                />
                <select
                  value={form.tokenType}
                  onChange={(e) => setForm({ ...form, tokenType: e.target.value as ManualForm["tokenType"] })}
                  className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
                >
                  <option value="system">System User</option>
                  <option value="user">User</option>
                  <option value="page">Page</option>
                  <option value="app">App</option>
                </select>
                <input
                  placeholder="Business ID — opcional"
                  value={form.businessId}
                  onChange={(e) => setForm({ ...form, businessId: e.target.value })}
                  className="h-10 px-3 text-sm bg-secondary border border-input rounded-md col-span-2"
                />
                <textarea
                  placeholder="Access token"
                  value={form.accessToken}
                  onChange={(e) => setForm({ ...form, accessToken: e.target.value })}
                  rows={3}
                  className="px-3 py-2 text-sm bg-secondary border border-input rounded-md font-mono col-span-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-3 h-9 text-sm rounded-md">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-3 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </form>
          ) : null}

          {busy && conns.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : null}

          {conns.length === 0 && !busy ? (
            <div className="bg-card border border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
              Sin conexiones. Conectá vía OAuth o pegá un token manual.
            </div>
          ) : null}

          <ul className="space-y-2">
            {conns.map((c) => (
              <li key={c.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{c.label}</h3>
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-secondary">
                        {c.tokenType}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                          c.status === "active"
                            ? "bg-green-900 text-green-300"
                            : c.status === "error"
                            ? "bg-red-900 text-red-300"
                            : "bg-secondary"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    {c.expiresAt ? (
                      <p className="text-xs text-muted-foreground">
                        Expira: {new Date(c.expiresAt).toLocaleString()}
                      </p>
                    ) : null}
                    {c.lastError ? <p className="text-xs text-red-400 max-w-2xl">{c.lastError}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => probeAccounts(c.id)}
                      disabled={probingId === c.id}
                      className="flex items-center gap-1 px-2 h-8 text-xs bg-secondary rounded-md disabled:opacity-50"
                    >
                      {probingId === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCcw className="h-3.5 w-3.5" />
                      )}
                      Ver ad accounts
                    </button>
                    <button
                      onClick={() => onDeleteConn(c.id)}
                      className="flex items-center gap-1 px-2 h-8 text-xs text-red-400 rounded-md"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {adAccounts[c.id] ? (
                  <details open className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      Ad accounts visibles ({adAccounts[c.id].length})
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {adAccounts[c.id].map((a) => (
                        <li key={a.id} className="flex justify-between gap-2 px-2 py-1 bg-secondary rounded">
                          <span className="truncate">
                            <code className="text-muted-foreground">{a.id}</code> — {a.name}
                          </span>
                          <span className="text-muted-foreground">{a.currency}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        {/* SECTION 2: Asignaciones por cliente */}
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">2. Asignar ad accounts a clientes</h2>
            <p className="text-xs text-muted-foreground">
              Cada cliente (company) queda enlazado a uno o más ad accounts. El Dashboard Agent
              usa el mapping para traer datos reales.
            </p>
          </div>

          <form onSubmit={onCreateMapping} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select
                value={mapForm.companyId}
                onChange={(e) => setMapForm({ ...mapForm, companyId: e.target.value })}
                className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
                required
              >
                <option value="">Cliente (company)…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={mapForm.connectionId}
                onChange={(e) => setMapForm({ ...mapForm, connectionId: e.target.value, adAccountId: "" })}
                className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
                required
              >
                <option value="">Conexión Meta…</option>
                {conns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              {adAccountsOfSelectedConn.length > 0 ? (
                <select
                  value={mapForm.adAccountId}
                  onChange={(e) => setMapForm({ ...mapForm, adAccountId: e.target.value })}
                  className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
                  required
                >
                  <option value="">Ad account…</option>
                  {adAccountsOfSelectedConn.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} — {a.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  placeholder={
                    mapForm.connectionId
                      ? "Pulsá 'Ver ad accounts' arriba primero, o pegá act_xxx"
                      : "act_xxx (después de elegir conexión)"
                  }
                  value={mapForm.adAccountId}
                  onChange={(e) => setMapForm({ ...mapForm, adAccountId: e.target.value })}
                  className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
                  required
                />
              )}
              <input
                placeholder="Label opcional (ej: Dunod Propiedades — Meta)"
                value={mapForm.label}
                onChange={(e) => setMapForm({ ...mapForm, label: e.target.value })}
                className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={busy || !mapForm.companyId || !mapForm.connectionId || !mapForm.adAccountId}
                className="flex items-center gap-2 px-3 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
              >
                <Link2 className="h-4 w-4" /> Asignar
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {companies.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin companies.</p>
            ) : null}
            {companies.map((co) => {
              const mappings = mappingsByCompany[co.id] ?? [];
              return (
                <div key={co.id} className="bg-card border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{co.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {mappings.length} ad account{mappings.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {mappings.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sin mappings.</p>
                  ) : (
                    <ul className="space-y-1">
                      {mappings.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between gap-2 px-2 py-1.5 bg-secondary rounded text-xs"
                        >
                          <div className="min-w-0 truncate">
                            <code className="text-muted-foreground">{m.adAccountId}</code>
                            {m.label ? <span> — {m.label}</span> : null}
                            <span className="text-muted-foreground"> · vía {m.connectionLabel ?? "?"}</span>
                          </div>
                          <button
                            onClick={() => onDeleteMapping(m.id)}
                            className="text-red-400"
                            title="Borrar mapping"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="bg-card border border-border rounded-lg p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">Como funciona (estilo Make):</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Conectá tu cuenta FB UNA sola vez (OAuth o System User token).</li>
            <li>El token ve todos los ad accounts que tu usuario administra en Business Manager.</li>
            <li>Asignás cada <code>act_xxx</code> al cliente (company) correspondiente.</li>
            <li>
              Cuando le pidas un dashboard al Dashboard Agent, él consulta los mappings y trae los
              números reales del cliente correcto.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
