# 🎵 TimeTune — Musikkarten Generator

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
- **CSV-Import** via Exportify — einfach & zuverlässig
- **Karten-Vorschau** — klicken zum Umdrehen (3D-Animation)
- **Individueller Text pro Karte** — Karte umdrehen und eigenen Text eintragen (z.B. Hinweis oder Kategorie)
- **Globaler Text** — gleichen Text auf alle Karten setzen (z.B. "Spieleabend 2025")
- **Filter & Suche** — nach Jahr, Artist, Titel
- **Zufalls-Auswahl** — X zufällige Karten aus der Playlist
- **4 Farbschemas** — Classic, Minimal, Vintage, Neon
- **Jahrzehnt-Farbbalken** — sofortige visuelle Dekaden-Erkennung
- **QR-Code Größe** — Klein / Normal / Groß
- **Schriftgröße** — Klein / Normal / Groß
- **Live-Vorschau** — alle Einstellungen aktualisieren die Kartenvorschau sofort
- **Duplex / Einseitig / Nur Vorder- / Nur Rückseite** Druckmodi
- **EN / DE** Sprachumschalter

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
├── index.html          — App UI + i18n (EN/DE)
├── style.css           — Styling
├── app.js              — CSV-Import, Karten-Logik, UI
├── card-generator.js   — Karten-Rendering für PDF
├── pdf-generator.js    — PDF-Erstellung mit jsPDF
└── libs/
    ├── qrcode-gen.js   — QR-Code Generator
    ├── qrcode.min.js   — QR-Code API Shim
    └── jspdf.umd.min.js — PDF Generator
```

---

## 🛠️ Tech Stack

- **Vanilla HTML/CSS/JS** — kein Framework, kein Build-Step
- **Exportify** — Spotify-Playlist Export als CSV
- **qrcode-generator** — clientseitige QR-Code Generierung
- **jsPDF** — clientseitige PDF-Erstellung
- **GitHub Pages** — kostenloses Hosting

---

## 📄 Lizenz

MIT — kostenlos nutzbar, veränderbar und weiterzugeben.

---

Made with ♪ by [JEM](https://github.com/c129h223n3o54) | Inspiriert vom Hitster-Spiel
