const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const REQUEST_TIMEOUT_MS = 15000;

const SYSTEM_PROMPT = `Du bist Orakil, ein antikes Orakel an der Kickoff-Veranstaltung einer Hochschule. Menschen bringen dir drei Stichworte zu ihrer aktuellen Situation mit Künstlicher Intelligenz. Antworte mit einem kurzen Orakelspruch im Stil eines antiken griechischen Orakels: kryptisch, poetisch, geheimnisvoll – aber stets wohlwollend, nie herabwürdigend oder verletzend. Der Spruch soll zum Nachdenken und zur Diskussion einladen, nicht eindeutig belehren oder werten. Wenn die Stichworte knapp, ungewöhnlich oder unvollständig sind, improvisiere wohlwollend weiter. Schreibe ausschliesslich auf Deutsch, in 2 bis 4 Sätzen. Antworte nur mit dem Spruch selbst – keine Anrede, keine Erklärung, keine Emojis, keine Markdown-Formatierung, keine Aufzählungen, keine internen oder System-XML-Tags.`;

const FALLBACK_SPRUECHE = [
  "Das Orakel schweigt für einen Moment – doch dein Weg mit der Künstlichen Intelligenz liegt bereits vor dir, wie ein Pfad im Morgennebel. Geh ihn mit offenen Augen.",
  "Manche Fragen beantwortet nicht das Orakel, sondern die Zeit selbst. Vertraue deiner Neugier, und die Antwort wird sich zeigen.",
  "Wo Maschine und Mensch sich begegnen, entsteht weder Licht noch Schatten allein – sondern etwas Drittes, das erst du gestalten musst.",
  "Die Sterne über Delphi kennen viele Wege. Deiner beginnt mit der nächsten Frage, die du zu stellen wagst.",
  "Selbst das älteste Orakel kennt nicht jede Antwort. Was bleibt, ist die Einladung, gemeinsam weiterzudenken.",
  "Kein Spruch fasst, was in dir bereits reift. Sprich mit denen um dich, und das Orakel wird durch euch weitersprechen.",
];

const MAX_KEYWORD_LENGTH = 60;
const MAX_SPRUECHE_IN_KV = 50;
const SPRUECHE_KV_KEY = "sprueche";

function randomFallback() {
  return FALLBACK_SPRUECHE[Math.floor(Math.random() * FALLBACK_SPRUECHE.length)];
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/generate" && request.method === "POST") {
        return await handleGenerate(request, env, headers);
      }
      if (url.pathname === "/sprueche" && request.method === "GET") {
        return await handleSprueche(env, headers);
      }
      return new Response("Not found", { status: 404, headers });
    } catch (err) {
      return jsonResponse({ error: "server" }, 500, headers);
    }
  },
};

async function handleGenerate(request, env, headers) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid_request" }, 400, headers);
  }

  const rawKeywords = Array.isArray(body?.keywords) ? body.keywords : [];
  const cleaned = rawKeywords
    .slice(0, 3)
    .map((k) => String(k ?? "").trim().slice(0, MAX_KEYWORD_LENGTH))
    .filter(Boolean);

  let spruch;
  let fallback = false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: "claude-opus-5",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        output_config: { effort: "low" },
        messages: [
          {
            role: "user",
            content: `Stichworte: ${cleaned.length ? cleaned.join(", ") : "(keine Angabe)"}`,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      return jsonResponse({ error: "technical" }, 502, headers);
    }

    const data = await anthropicResponse.json();

    if (data.stop_reason === "refusal") {
      spruch = randomFallback();
      fallback = true;
    } else {
      const textBlock = Array.isArray(data.content) ? data.content.find((b) => b.type === "text") : null;
      spruch = textBlock?.text?.trim();
      if (!spruch) {
        spruch = randomFallback();
        fallback = true;
      }
    }
  } catch (err) {
    return jsonResponse({ error: "technical" }, 502, headers);
  } finally {
    clearTimeout(timeout);
  }

  try {
    await appendSpruch(env, spruch);
  } catch {
    // KV-Fehler dürfen die Anzeige des Spruchs beim Nutzer nicht verhindern
  }

  return jsonResponse({ spruch, fallback }, 200, headers);
}

async function handleSprueche(env, headers) {
  const list = await readSprueche(env);
  const newestFirst = [...list].reverse();
  return jsonResponse({ sprueche: newestFirst }, 200, headers);
}

async function readSprueche(env) {
  const raw = await env.ORAKIL_KV.get(SPRUECHE_KV_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function appendSpruch(env, text) {
  const list = await readSprueche(env);
  list.push({ text, timestamp: Date.now() });
  const trimmed = list.length > MAX_SPRUECHE_IN_KV ? list.slice(list.length - MAX_SPRUECHE_IN_KV) : list;
  await env.ORAKIL_KV.put(SPRUECHE_KV_KEY, JSON.stringify(trimmed));
}
