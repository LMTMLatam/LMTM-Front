const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lmtm.onrender.com";

interface AskResponse {
  output?: string;
  agent?: string;
  error?: string;
}

export async function sendMessage(
  prompt: string,
  agent: string,
  client?: string
): Promise<AskResponse> {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, agent, client }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export { API_URL };