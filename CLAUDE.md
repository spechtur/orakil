# CLAUDE.md – Orakil

> Projektgedächtnis für Claude Code
> Letzte Aktualisierung: 16.08.2026

---

## Projektüberblick

Orakil ist eine interaktive Einstiegsaktivität für die Kickoff-Veranstaltung der KI-Offensive Zyklus 3 (PHGR). Teilnehmende geben auf dem Smartphone drei Stichworte zu ihrer "Situation mit KI" ein, ein LLM generiert daraus einen kryptisch-wohlwollenden Orakelspruch. Zusätzlich läuft eine gemeinsame Beamer-Ansicht, auf der neu generierte Sprüche live erscheinen.

---

## Tech-Stack

- **Frontend:** Vanilla HTML/CSS/JS (Single File), zwei Views: Eingabeformular (mobile) und Beamer-Ansicht (Grossbildschirm)
- **Backend:** Neuer, dedizierter Cloudflare Worker als Proxy zur Anthropic API (eigener API Key, getrennt von anderen Tools von David)
- **Shared State:** Cloudflare KV für den Live-Abgleich zwischen Handy-Eingaben und Beamer-Ansicht (Polling, kein Supabase)
- **Hosting:** GitHub Pages – Repo: `github.com/spechtur/orakil`
- **Deployment:** Push to main → automatisch live (GitHub Pages); Worker separat via Wrangler deployen

---

## Design-System

Bewusst **kein** PHGR-CI hier – eigenständige Ästhetik: griechisch-antikes Orakel-Motiv.

- Farbwelt: Marmor-Weiss/Creme, gedecktes Gold/Antik-Bronze als Akzent, dunkler Hintergrund (Nachthimmel/Tempel-Stimmung)
- Typografie: Serifenschrift für Orakelsprüche (feierlich, leicht mystisch), klare serifenlose Schrift für UI-Elemente (Formular, Buttons)
- Motive: Säulen, Marmor-Textur (CSS-Gradient/Noise, kein schweres Bildasset), sanftes "Nebel"-Reveal der Antwort (z. B. CSS-Animation, Text blendet aus Unschärfe ein)
- Name konsequent "Orakil" (nicht "Orakel") in UI-Texten

---

## Konventionen

- Alle Texte auf Deutsch, Du-Form
- Keine externen CDN-Abhängigkeiten wenn vermeidbar (Event-Kontext, WLAN kann instabil sein)
- API Key ausschliesslich im Worker, nie im Frontend
- Mobile-first für die Eingabe-View; die Beamer-View separat für grosse Screens optimieren
- Kurze, robuste Fehlerbehandlung – bei einer Live-Aktivität vor Publikum darf nichts hart abstürzen

---

## Bekannte Einschränkungen

- Zeitfenster der Aktivität ist knapp (10–15 Min. für ~10 Personen) – Ladezeiten und Antwortzeiten der API sind kritisch, ein Timeout-Handling mit Retry-Button ist Pflicht, kein optionales Extra
- Beamer-Ansicht ist der komplexeste Teil (Polling + KV) – bei Zeitdruck im Bau zuerst die Handy-Eingabe + Generierung fertigstellen, Beamer-Sync danach
- Content-Filter soll bei problematischen Eingaben nicht mit einer sichtbaren Fehlermeldung reagieren, sondern mit einem neutralen Fallback-Spruch, damit die Live-Situation vor Publikum nicht peinlich wird

---

## Verwandte Tools im Repo (als Referenz)

- Bestehende Cloudflare-Worker-Proxy-Struktur aus Davids anderen Tools (Muster für sicheren API-Zugriff)
- Bestehende Web-Tools unter `spechtur` (Word Cloud, Group Generator, Timer) als Referenz für Deployment-Workflow auf GitHub Pages
