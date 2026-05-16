"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, RefreshCcw, Trash2, BarChart3, ExternalLink } from "lucide-react";
import {
  listMetaConnections,
  createMetaConnection,
  deleteMetaConnection,
  listMetaAdAccounts,
  getMetaInsights,
  metaOauthStartUrl,
  type MetaConnection,
  type MetaAdAccount,
  type MetaInsightsRow,
} from "../../../lib/api";
import { useSession } from "../../../lib/session";

type FormState = {
  label: string;
  accessToken: string;
  tokenType: "system" | "user" | "page" | "app";
  adAccountId: string;
  pageId: string;
  businessId: string;
};

const EMPTY_FORM: FormState = {
  label: "",
  accessToken: "",
  tokenType: "system",
  adAccountId: "",
  pageId: "",
  businessId: "",
};

export default function MetaIntegrationsPage() {
  const { loading, user } = useSession();
  const [items, setItems] = useState<MetaConnection[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [accounts, setAccounts] = useState<Record<string, MetaAdAccount[]>>({});
  const [insights, setInsights] = useState<Record<string, MetaInsightsRow[]>>({});
  const [probingId, setProbingId] = useState<string | null>(null);

  async function refresh() {
    setBusy(true);
    setError(null);
    try {
      setItems(await listMetaConnections());
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
    if (!form.label.trim() || !form.accessToken.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createMetaConnection({
        label: form.label.trim(),
        accessToken: form.accessToken.trim(),
        tokenType: form.tokenType,
        adAccountId: form.adAccountId.trim() || undefined,
        pageId: form.pageId.trim() || undefined,
        businessId: form.businessId.trim() || undefined,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("¿Borrar esta conexión?")) return;
    setBusy(true);
    setError(null);
    try {
      await deleteMetaConnection(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function probeAccounts(id: string) {
    setProbingId(id);
    setError(null);
    try {
      const r = await listMetaAdAccounts(id);
      setAccounts((prev) => ({ ...prev, [id]: r.data }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setProbingId(null);
    }
  }

  async function probeInsights(id: string, adAccount: string | null) {
    setProbingId(id);
    setError(null);
    try {
      const r = await getMetaInsights({
        connection: id,
        adAccount: adAccount ?? undefined,
        datePreset: "last_7d",
      });
      setInsights((prev) => ({ ...prev, [id]: r.rows }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setProbingId(null);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="h-full overflow-y-auto scrollbar-auto-hide">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Meta (Facebook / Instagram)</h1>
            <p className="text-sm text-muted-foreground">
              Conectá ad accounts y páginas para que el Dashboard Agent pueda leer insights.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={metaOauthStartUrl("Meta Ads")}
              className="flex items-center gap-2 px-3 h-9 bg-secondary border border-input rounded-md text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" /> OAuth (User token)
            </a>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 px-3 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium"
            >
              <Plus className="h-4 w-4" /> Token manual
            </button>
          </div>
        </div>

        {error ? <p className="text-xs text-red-400">{error}</p> : null}

        {showForm ? (
          <form onSubmit={onCreate} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Pegá un <b>System User token</b> de Business Manager para acceso sin expiración.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Label (ej: Dunod Meta Ads)"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
                required
              />
              <select
                value={form.tokenType}
                onChange={(e) => setForm({ ...form, tokenType: e.target.value as FormState["tokenType"] })}
                className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
              >
                <option value="system">System User</option>
                <option value="user">User</option>
                <option value="page">Page</option>
                <option value="app">App</option>
              </select>
              <input
                placeholder="Ad Account ID (act_xxx) — opcional"
                value={form.adAccountId}
                onChange={(e) => setForm({ ...form, adAccountId: e.target.value })}
                className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
              />
              <input
                placeholder="Page ID — opcional"
                value={form.pageId}
                onChange={(e) => setForm({ ...form, pageId: e.target.value })}
                className="h-10 px-3 text-sm bg-secondary border border-input rounded-md"
              />
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

        {busy && items.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : null}

        {items.length === 0 && !busy ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
            Sin conexiones. Conectá vía OAuth o pegá un token manual.
          </div>
        ) : null}

        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{c.label}</h3>
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
                  <div className="text-xs text-muted-foreground">
                    {c.adAccountId ? `Ad Account: ${c.adAccountId}` : "Sin ad account asignado"}
                    {c.pageId ? ` · Page: ${c.pageId}` : ""}
                    {c.businessId ? ` · Business: ${c.businessId}` : ""}
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
                    <RefreshCcw className="h-3.5 w-3.5" /> Ad accounts
                  </button>
                  <button
                    onClick={() => probeInsights(c.id, c.adAccountId)}
                    disabled={probingId === c.id || (!c.adAccountId && !accounts[c.id]?.length)}
                    className="flex items-center gap-1 px-2 h-8 text-xs bg-secondary rounded-md disabled:opacity-50"
                  >
                    <BarChart3 className="h-3.5 w-3.5" /> Insights 7d
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="flex items-center gap-1 px-2 h-8 text-xs text-red-400 rounded-md"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {accounts[c.id] ? (
                <details open className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    Ad accounts visibles ({accounts[c.id].length})
                  </summary>
                  <ul className="mt-2 space-y-1">
                    {accounts[c.id].map((a) => (
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

              {insights[c.id] ? (
                <details open className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    Insights últimos 7d ({insights[c.id].length} filas)
                  </summary>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead className="text-muted-foreground">
                        <tr>
                          <th className="text-left p-1">Día</th>
                          <th className="text-right p-1">Spend</th>
                          <th className="text-right p-1">Impr.</th>
                          <th className="text-right p-1">Clicks</th>
                          <th className="text-right p-1">CTR</th>
                          <th className="text-right p-1">CPC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {insights[c.id].map((r, i) => (
                          <tr key={i} className="border-t border-border/50">
                            <td className="p-1">{r.date_start}</td>
                            <td className="p-1 text-right">{r.spend ?? "-"}</td>
                            <td className="p-1 text-right">{r.impressions ?? "-"}</td>
                            <td className="p-1 text-right">{r.clicks ?? "-"}</td>
                            <td className="p-1 text-right">{r.ctr ?? "-"}</td>
                            <td className="p-1 text-right">{r.cpc ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="bg-card border border-border rounded-lg p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground">Setup rápido (System User, sin App Review):</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              Entrá a <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">business.facebook.com</a> → Configuración → Usuarios → Usuarios del sistema → Agregar.
            </li>
            <li>Asignale las páginas y ad accounts de tus clientes (rol Admin).</li>
            <li>Generá un token con permisos: <code>ads_read, ads_management, pages_read_engagement, business_management, read_insights</code>.</li>
            <li>Pegalo acá con &quot;Token manual&quot; (tipo: System User) y opcionalmente el <code>act_xxx</code> del cliente.</li>
            <li>Probá &quot;Ad accounts&quot; → seleccioná uno → &quot;Insights 7d&quot; para verificar.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
