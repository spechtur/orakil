# Orakil

Test
Interaktive Einstiegsaktivität für die Kickoff-Veranstaltung der KI-Offensive Zyklus 3 (PHGR, Herbstsemester).

Teilnehmende geben auf dem Smartphone drei Stichworte zu ihrer aktuellen "Situation mit KI" ein. Ein LLM generiert daraus einen kryptisch-wohlwollenden, zur Diskussion einladenden Orakelspruch im antiken Register. Neu generierte Sprüche erscheinen zusätzlich live auf einer gemeinsamen Beamer-Ansicht.

Details zu Funktionsumfang und Architektur: siehe [REQUIREMENTS.md](./REQUIREMENTS.md) und [CLAUDE.md](./CLAUDE.md).

---

## Struktur

```
/
├── index.html            # Eingabeformular (mobile, via QR-Code)
├── beamer.html           # Gemeinsame Live-Ansicht (Grossbildschirm)
├── /worker               # Cloudflare Worker Code (API-Proxy + KV)
│   ├── src/index.js
│   ├── package.json
│   └── wrangler.toml
├── REQUIREMENTS.md
└── CLAUDE.md
```

---

## Setup

### 1. Frontend (GitHub Pages)

- Repo ist bereits auf GitHub Pages aktiv (Branch `main`, Root)
- Push auf `main` → automatisch live

### 2. Worker (Cloudflare)

1. Neuen Worker im Cloudflare Dashboard anlegen (dediziert für Orakil, getrennt von anderen Tools)
2. Ins `worker/`-Verzeichnis wechseln und Abhängigkeiten installieren:
   ```
   cd worker
   npm install
   ```
3. Neuen Anthropic API Key erstellen und als Secret im Worker hinterlegen:
   ```
   wrangler secret put ANTHROPIC_API_KEY
   ```
4. KV-Namespace anlegen:
   ```
   wrangler kv:namespace create "ORAKIL_KV"
   ```
   Die zurückgegebene `id` in `worker/wrangler.toml` bei `kv_namespaces` eintragen (ersetzt `REPLACE_WITH_KV_ID`)
5. Deployen:
   ```
   wrangler deploy
   ```
6. Worker-URL (z. B. `https://orakil-worker.<subdomain>.workers.dev`) in `index.html` und `beamer.html` bei der Konstante `WORKER_URL` eintragen

### 3. QR-Code

QR-Code auf die GitHub-Pages-URL des Eingabeformulars generieren (z. B. für Beamer-Folie oder Ausdruck am Event).

---

## Status

🚧 In Entwicklung – Kickoff-Event KI-Offensive Zyklus 3, Herbstsemester 2026
