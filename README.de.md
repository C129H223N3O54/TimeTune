# 🎵 TimeTune — Musikkarten Generator

Teil der [**Sideforge**](https://github.com/C129H223N3O54/SideForge) Tool-Suite.

> Tools, crafted on the side.

Generiere druckfertige Musikkarten aus deinen Spotify-Playlists für das chronologische Musikraten-Spiel.

👉 **[c129h223n3o54.github.io/TimeTune](https://c129h223n3o54.github.io/TimeTune/)** ← App öffnen

---

## 🎮 Wie funktioniert's?

### 1. Playlist exportieren
Gehe zu **[exportify.net](https://exportify.net)** → mit Spotify einloggen → bei deiner Playlist auf **"Export"** klicken → CSV wird heruntergeladen.

### 2. CSV hochladen
Öffne TimeTune, ziehe die CSV-Datei in den Upload-Bereich — fertig!

### 3. Anpassen & PDF generieren
Karten vorschauen, nach Jahr filtern, Design wählen, PDF erstellen — drucken, ausschneiden, spielen!

---

## 🃏 Karten-Format

- **Größe:** 63 × 89 mm (Standard Pokerkarten-Format)
- **Vorderseite:** QR-Code (öffnet Song direkt auf Spotify) + TimeTune Branding
- **Rückseite:** Artist, Songtitel, Album und das **JAHR** — die Kerninformation
- **6 Karten pro A4-Seite** (2 Spalten × 3 Reihen)
- **Duplex-Druck** mit automatischer Spiegel-Logik für perfekte Ausrichtung

---

## 🎯 Spielregeln

1. Alle Karten mischen und verdeckt stapeln
2. Erste Karte aufdecken — sie startet die Zeitlinie
3. Jede Runde: Karte aufdecken, Jahr schätzen, an die richtige Stelle legen
4. Rückseite prüfen — richtig? Behalten. Falsch? Zurück in den Stapel.
5. Wer zuerst 10 Karten gesammelt hat, gewinnt!

📱 QR-Code scannen → Song spielt direkt auf Spotify ab

---

## ✨ Features

- **Kein Login, kein Server** — alles läuft im Browser
- **CSV-Import** via Exportify (und Hitster-CSV-Format automatisch erkannt)
- **Karten-Vorschau** — klicken zum Umdrehen (3D-Animation)
- **Individueller Text pro Karte** — Karte umdrehen, eigenen Text eintippen
- **Globaler Text** — gleichen Text auf alle Karten (z.B. "Spieleabend 2025")
- **Filter & Suche** — nach Jahr, Artist, Titel
- **Zufalls-Auswahl** — X zufällige Karten aus der Playlist
- **4 Farbschemas für gedruckte Karten** — Classic, Minimal, Vintage, Neon
- **Jahrzehnt-Farbbalken** — sofortige visuelle Dekaden-Erkennung
- **QR-Code Größe** — Klein / Normal / Groß
- **Schriftgröße** — Klein / Normal / Groß
- **Live-Vorschau** — alle Einstellungen aktualisieren die Vorschau sofort
- **Duplex / Einseitig / Nur Vorder- / Nur Rückseite** Druckmodi
- **Light / Dark UI** — Sideforge Design-System
- **EN / DE** Sprachumschalter

---

## 🎨 Design

TimeTune nutzt das [Sideforge Design-System](https://github.com/C129H223N3O54/SideForge):

- Ember-Orange (`#E8600A`) als Primärfarbe
- Moss-Grün für Erfolgs-States
- Anvil warme Grautöne als Neutrals
- Verdana für UI, Georgia italic für Branding
- Light + Dark Mode Schalter im Header

---

## 🖨️ Drucktipps

- **Papier:** 200 g/m² Karton für beste Ergebnisse
- **Skalierung:** 100% (kein "An Seite anpassen")
- **Duplex:** "Auf der Schmalseite wenden" einstellen
- Entlang der gestrichelten Linien ausschneiden
- Optional laminieren für längere Haltbarkeit

---

## 🚀 Eigene Instanz hosten (GitHub Pages)

1. Dieses Repo **forken** (oben rechts "Fork")
2. Im geforkten Repo: **Settings → Pages → Branch: main / (root) → Save**
3. Nach ~1 Minute läuft deine eigene Instanz unter:
   `https://DEIN-USERNAME.github.io/TimeTune/`

Kein Terminal, kein Build-Schritt, keine Konfiguration nötig. ✅

---

## 📁 Dateistruktur

```
TimeTune/
├── index.html              — App UI + i18n (EN/DE)
├── sideforge-tokens.css    — Sideforge Design-Tokens
├── style.css               — App-spezifisches Styling
├── app.js                  — CSV-Import, Karten-Logik, UI
├── card-generator.js       — Karten-Rendering für PDF
├── pdf-generator.js        — PDF-Erstellung mit jsPDF
└── libs/
    ├── qrcode-gen.js       — QR-Code Generator
    ├── qrcode.min.js       — QR-Code API Shim
    └── jspdf.umd.min.js    — PDF Generator
```

---

## 🛠️ Tech Stack

- **Vanilla HTML/CSS/JS** — kein Framework, kein Build-Step
- **Sideforge Design-System** — gemeinsame Tokens für alle Tools
- **Exportify** — Spotify-Playlist Export als CSV
- **qrcode-generator** — clientseitige QR-Code Generierung
- **jsPDF** — clientseitige PDF-Erstellung
- **GitHub Pages** — kostenloses Hosting

---

## 📄 Lizenz

MIT — kostenlos nutzbar, veränderbar und weiterzugeben.

---

Made with ♪ by [kampfmade](https://github.com/c129h223n3o54) | Inspiriert vom Hitster-Spiel | Teil von [Sideforge](https://github.com/C129H223N3O54/SideForge)
