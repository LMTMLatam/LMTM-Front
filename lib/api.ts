const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lmtm.onrender.com";
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || "e3400d17-6cdd-4d05-a3bb-49ccc38db17d";

const TOKEN_KEY = "lmtm.token";
const USER_KEY = "lmtm.user";

export type AuthUser = { id: string; email: string; name?: string | null };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function setSession(token: string, user: AuthUser) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, init: RequestInit = {}, expect: "json" | "text" = "json"): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail = parsed.error ?? parsed.message ?? text;
    } catch {}
    throw new Error(`${res.status} ${detail || res.statusText}`);
  }
  if (expect === "text") return (await res.text()) as unknown as T;
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export const COMPANY = { id: COMPANY_ID };
export const API_BASE = API_URL;

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sign in failed: ${text || res.statusText}`);
  }
  const data = (await res.json()) as { token: string; user: AuthUser };
  if (!data.token || !data.user) throw new Error("Sign in returned no token");
  setSession(data.token, data.user);
  return data.user;
}

export async function signUp(email: string, password: string, name: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sign up failed: ${text || res.statusText}`);
  }
  const data = (await res.json()) as { token: string; user: AuthUser };
  setSession(data.token, data.user);
  return data.user;
}

export async function signOut(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/sign-out`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken() ?? ""}` },
    });
  } catch {}
  clearSession();
}

// --- Health ---
export type HealthInfo = {
  status: string;
  deploymentMode?: string;
  bootstrapStatus?: string;
  version?: string;
};

export const getHealth = () => request<HealthInfo>("/api/health");

// --- Companies ---
export type Company = { id: string; name: string; status?: string };
export const listCompanies = () => request<Company[]>("/api/companies");

// --- Projects ---
export type Project = {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  status?: string;
  color?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const listProjects = () => request<Project[]>(`/api/companies/${COMPANY.id}/projects`);
export const getProject = (id: string) => request<Project>(`/api/projects/${id}`);
export const createProject = (body: { name: string; description?: string; status?: string }) =>
  request<Project>(`/api/companies/${COMPANY.id}/projects`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const updateProject = (id: string, body: Partial<Project>) =>
  request<Project>(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteProject = (id: string) =>
  request<void>(`/api/projects/${id}`, { method: "DELETE" });

// --- Goals ---
export type Goal = {
  id: string;
  companyId: string;
  title: string;
  description?: string | null;
  level: "company" | "team" | "project" | "task";
  status: "planned" | "active" | "completed" | "cancelled";
  ownerAgentId?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const listGoals = () => request<Goal[]>(`/api/companies/${COMPANY.id}/goals`);
export const createGoal = (body: {
  title: string;
  description?: string;
  level?: Goal["level"];
  status?: Goal["status"];
}) =>
  request<Goal>(`/api/companies/${COMPANY.id}/goals`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const updateGoal = (id: string, body: Partial<Goal>) =>
  request<Goal>(`/api/goals/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteGoal = (id: string) => request<void>(`/api/goals/${id}`, { method: "DELETE" });

// --- Agents ---
export type Agent = {
  id: string;
  companyId: string;
  name: string;
  role: string;
  title?: string | null;
  status: string;
  adapterType: string;
  icon?: string | null;
  capabilities?: string | null;
  desiredSkills?: string[];
  createdAt: string;
};

export const listAgents = () => request<Agent[]>(`/api/companies/${COMPANY.id}/agents`);
export const getAgent = (id: string) => request<Agent>(`/api/agents/${id}`);
export const hireAgent = (body: {
  name: string;
  role?: string;
  title?: string;
  capabilities?: string;
  desiredSkills?: string[];
  adapterType: string;
  adapterConfig?: Record<string, unknown>;
}) =>
  request<Agent>(`/api/companies/${COMPANY.id}/agent-hires`, {
    method: "POST",
    body: JSON.stringify(body),
  });

// --- Adapters ---
export type AdapterInfo = {
  type: string;
  label: string;
  modelsCount: number;
  source: string;
  loaded: boolean;
  disabled: boolean;
};

export const listAdapters = () => request<AdapterInfo[]>("/api/adapters");

// --- Dashboards (deploy to Vercel) ---
export type DeployResponse = {
  id: string;
  projectName: string;
  target: "preview" | "production";
  url: string;
  readyState: string;
};

export const deployDashboard = (body: {
  name: string;
  html?: string;
  files?: Array<{ file: string; data: string; encoding?: "utf-8" | "base64" }>;
  target?: "preview" | "production";
}) =>
  request<DeployResponse>("/api/dashboards/deploy", {
    method: "POST",
    body: JSON.stringify(body),
  });

// --- Meta connections ---
export type MetaConnection = {
  id: string;
  label: string;
  businessId: string | null;
  pageId: string | null;
  adAccountId: string | null;
  tokenType: "user" | "system" | "page" | "app";
  scopes: string[];
  status: string;
  expiresAt: string | null;
  lastCheckAt: string | null;
  lastError: string | null;
  createdAt: string;
};

export const listMetaConnections = () =>
  request<MetaConnection[]>(`/api/companies/${COMPANY.id}/meta/connections`);

export const createMetaConnection = (body: {
  label: string;
  accessToken: string;
  tokenType?: "user" | "system" | "page" | "app";
  businessId?: string;
  pageId?: string;
  adAccountId?: string;
  scopes?: string[];
}) =>
  request<{ id: string }>(`/api/companies/${COMPANY.id}/meta/connections`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateMetaConnection = (id: string, body: Partial<{ label: string; accessToken: string; adAccountId: string; pageId: string; businessId: string }>) =>
  request<void>(`/api/meta/connections/${id}`, { method: "PATCH", body: JSON.stringify(body) });

export const deleteMetaConnection = (id: string) =>
  request<void>(`/api/meta/connections/${id}`, { method: "DELETE" });

export type MetaAdAccount = { id: string; account_id: string; name: string; currency: string };
export const listMetaAdAccounts = (connectionId: string) =>
  request<{ data: MetaAdAccount[] }>(`/api/meta/connections/${connectionId}/ad-accounts`);

export type MetaInsightsRow = {
  date_start?: string;
  date_stop?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  reach?: string;
  frequency?: string;
  actions?: Array<{ action_type: string; value: string }>;
};

export const getMetaInsights = (params: {
  adAccount?: string;
  connection?: string;
  since?: string;
  until?: string;
  datePreset?: string;
}) => {
  const q = new URLSearchParams({ company: COMPANY.id });
  if (params.adAccount) q.set("adAccount", params.adAccount);
  if (params.connection) q.set("connection", params.connection);
  if (params.since) q.set("since", params.since);
  if (params.until) q.set("until", params.until);
  if (params.datePreset) q.set("datePreset", params.datePreset);
  return request<{ adAccount: string; rows: MetaInsightsRow[] }>(`/api/meta/insights?${q.toString()}`);
};

export const metaOauthStartUrl = (label?: string) => {
  const q = new URLSearchParams({ companyId: COMPANY.id });
  if (label) q.set("label", label);
  return `${API_URL}/api/meta/oauth/start?${q.toString()}`;
};

// --- Agent chat (authenticated, tool-calling loop) ---
export type AgentChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_call_id?: string;
  tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>;
};

export type AgentChatResponse = {
  output: string;
  agent: string;
  toolTrace: Array<{ name: string; args: unknown; result: unknown }>;
};

export const agentChat = (body: {
  agent: string;
  messages: AgentChatMessage[];
  client?: string;
}) =>
  request<AgentChatResponse>("/api/agents/chat", {
    method: "POST",
    body: JSON.stringify({ ...body, companyId: COMPANY.id }),
  });

// --- Ask (MiniMax bridge, public) ---
export type AskResponse = {
  output?: string;
  agent?: string;
  error?: string;
  detail?: string;
};

export async function ask(prompt: string, agent: string, client?: string): Promise<AskResponse> {
  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, agent, client }),
  });
  if (!res.ok) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { error: text || res.statusText };
    }
  }
  return res.json();
}
