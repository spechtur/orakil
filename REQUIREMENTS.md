# REQUIREMENTS – Orakil

> Erstellt: 16.08.2026
> Autor: David Halser / PHGR
> Status: Draft

---

## 1. Projektzweck

Orakil ist eine interaktive Web-Aktivität für die Kickoff-Veranstaltung der KI-Offensive Zyklus 3 (PHGR, Herbstsemester). Teilnehmende geben drei Stichworte zu ihrer aktuellen "Situation mit KI" ein; ein LLM generiert daraus einen leicht kryptischen, wohlwollenden, zur Diskussion einladenden Orakelspruch im antiken Orakel-Register. Die generierten Sprüche erscheinen zusätzlich live auf einer gemeinsamen Beamer-Ansicht.

---

## 2. Nutzer & Kontext

- **Primäre Nutzer:** ~10 Teilnehmende der KI-Offensive Zyklus 3, heterogene Gruppe (Enthusiast:innen bis offen KI-Ablehnende)
- **Nutzungskontext:** Einstiegsaktivität am Kickoff-Event, ca. 10–15 Minuten Zeitfenster, Zugriff via QR-Code
- **Gerät:** Smartphone (Eingabe) + grosser Bildschirm/Beamer (gemeinsame Anzeige)

---

## 3. Funktionale Anforderungen (Pflicht)

| # | Feature | Akzeptanzkriterium |
|---|---------|-------------------|
| F1 | Eingabeformular mit 3 Stichwort-Feldern | TN kann auf dem Smartphone in unter 20 Sekunden drei Stichworte eingeben und absenden |
| F2 | Orakelspruch-Generierung via LLM (eigener Cloudflare Worker als Proxy) | Antwort erscheint innert ca. 3–5 Sekunden, Ton ist kryptisch-wohlwollend-diskussionseinladend, nie herabwürdigend |
| F3 | Live-Beamer-Ansicht zeigt neu generierte Sprüche automatisch an | Neuer Spruch erscheint auf dem Beamer innerhalb weniger Sekunden nach Generierung, ohne manuelles Neuladen |
| F4 | Fallback bei gefiltertem/problematischem Input | Statt Fehlermeldung oder unpassender Antwort erscheint ein neutraler, wohlwollender Fallback-Spruch |
| F5 | "Nochmal"-Button | Erneutes Generieren möglich, falls Antwort unpassend, leer oder technisch fehlgeschlagen ist |

---

## 4. Nicht im Scope

- Nutzerkonten / Login
- Dauerhafte Persistenz über das Event hinaus (Sprüche müssen nur für die Dauer der Session sichtbar sein)
- Mehrsprachigkeit (nur Deutsch)
- Moderations-Interface / nachträgliches Editieren einzelner Sprüche
- Beamer-Ansicht kann bei Zeitdruck als Phase-2-Feature ausgelagert werden (siehe Offene Fragen)

---

## 5. Fehlerfälle & Edge Cases

| Fehlerfall | Erwartetes Verhalten |
|------------|---------------------|
| Leere oder sehr kurze Eingabe (z. B. nur 1 Wort) | Trotzdem generieren, KI improvisiert wohlwollend |
| Anstössiger / unsinniger Input | Standard-Content-Filter greift; bei Ablehnung neutraler Fallback-Spruch statt Fehlermeldung |
| Worker-/API-Timeout oder Netzwerkfehler | Fehlermeldung + "Nochmal"-Button, kein Absturz der Seite |
| Beamer-Ansicht verliert Verbindung zum Worker | Zeigt letzten bekannten Zustand + dezenten Hinweis, kein leerer Bildschirm |

---

## 6. Technische Rahmenbedingungen

- **Hosting:** GitHub Pages, neues eigenständiges Repo (Vorschlag: `spechtur/orakil`)
- **Backend:** Neuer, dedizierter Cloudflare Worker als Proxy zur Anthropic API mit eigenem, neuem API Key – bewusst getrennt von bestehenden Tools
- **Shared State (Beamer-Ansicht):** Cloudflare KV – Worker schreibt jeden neu generierten Spruch in KV, Beamer-View pollt einen Worker-Endpoint alle 2–3 Sekunden. Kein Supabase nötig für diesen Zweck.
- **Design:** Griechisch-antikes Motiv ("Orakil"), Säulen-Optik, Marmor-Textur, Serifenschrift, sanftes "Nebel"-Reveal der Antwort. Bewusst eigenständige Ästhetik, kein PHGR-CI-Zwang.
- **DSGVO:** Eingaben sind anonyme Stichworte ohne Namensbezug – unkritisch. Keine Speicherung über die Session hinaus erforderlich.
- **Responsive:** Mobile-first für das Eingabeformular, Grossbildschirm-optimiert für die Beamer-Ansicht

---

## 7. Offene Fragen

- [ ] Exakter Ton/System-Prompt für die Orakelspruch-Generierung (nächster Schritt nach diesem Dokument)
- [ ] Timing: Geben TN die Stichworte während der Anmoderation ein, oder erst beim eigenen Redebeitrag?
- [ ] Reihenfolge auf dem Beamer: chronologisch oder gemischt/zufällig?
- [ ] Falls Zeitbudget knapp wird: Beamer-Ansicht (F3) als Phase 2 nachziehen, Orakil startet handy-only
