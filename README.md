# 🎵 TimeTune — Music Card Generator

Part of the [**Sideforge**](https://github.com/C129H223N3O54/SideForge) tool suite.

> Tools, crafted on the side.

Generate print-ready music cards from your Spotify playlists for the chronological music guessing game.

👉 **[c129h223n3o54.github.io/TimeTune](https://c129h223n3o54.github.io/TimeTune/)** ← Open App

---

## 🎮 How It Works

### 1. Export your playlist
Go to **[exportify.net](https://exportify.net)** → log in with Spotify → click **"Export"** next to your playlist → CSV downloads automatically.

### 2. Upload the CSV
Open TimeTune, drag the CSV file into the upload area — done!

### 3. Customize & generate PDF
Preview cards, filter by year, choose a design, generate PDF — print, cut, play!

---

## 🃏 Card Format

- **Size:** 63 × 89 mm (standard poker card format)
- **Front:** QR code (opens song directly on Spotify) + TimeTune branding
- **Back:** Artist, song title, album and the **YEAR** — the key information
- **6 cards per A4 page** (2 columns × 3 rows)
- **Duplex print** with automatic mirroring for perfect alignment

---

## 🎯 Game Rules

1. Shuffle all cards and place them face-down
2. Flip the first card — it starts your timeline
3. Each turn: flip a card, guess the year, place it in your timeline
4. Check the year on the back — correct? Keep it. Wrong? Back in the pile.
5. First to collect 10 (or your chosen number) wins!

📱 Scan the QR code → song plays directly on Spotify

---

## ✨ Features

- **No login, no server** — runs entirely in the browser
- **CSV import** via Exportify (and Hitster CSV format auto-detected)
- **Card preview** — click to flip (3D animation)
- **Individual card text** — flip a card and add custom text per card
- **Global custom text** — same text on all cards (e.g. "Game Night 2025")
- **Filter & search** — by year, artist, title
- **Random selection** — pick X random cards from the playlist
- **4 color themes** — Classic, Minimal, Vintage, Neon (printed cards)
- **Decade color bars** — instant visual decade identification
- **QR code size** — Small / Normal / Large
- **Font size** — Small / Normal / Large
- **Live preview** — all settings update the card preview instantly
- **Duplex / Single-sided / Front-only / Back-only** print modes
- **Light / Dark UI** — Sideforge design system
- **EN / DE** language toggle

---

## 🎨 Design

TimeTune uses the [Sideforge design system](https://github.com/C129H223N3O54/SideForge):

- Ember-Orange (`#E8600A`) as primary accent
- Moss-Green for success states
- Anvil warm grayscale neutrals
- Verdana for UI, Georgia italic for branding
- Light + Dark mode toggle in header

---

## 🖨️ Print Tips

- **Paper:** 200 g/m² cardstock for best results
- **Scale:** 100% (no "fit to page")
- **Duplex:** set "flip on short edge"
- Cut along the dashed lines
- Optionally laminate for durability

---

## 🚀 Host Your Own Instance (GitHub Pages)

1. **Fork** this repo (top right "Fork")
2. In your fork: **Settings → Pages → Branch: main / (root) → Save**
3. After ~1 minute your own instance is live at:
   `https://YOUR-USERNAME.github.io/TimeTune/`

No terminal, no build step, no configuration needed. ✅

---

## 📁 File Structure

```
TimeTune/
├── index.html              — App UI + i18n (EN/DE)
├── sideforge-tokens.css    — Sideforge design tokens
├── style.css               — App-specific styling
├── app.js                  — CSV import, card logic, UI
├── card-generator.js       — Card rendering for PDF
├── pdf-generator.js        — PDF creation with jsPDF
└── libs/
    ├── qrcode-gen.js       — QR code generator
    ├── qrcode.min.js       — QR code API shim
    └── jspdf.umd.min.js    — PDF generator
```

---

## 🛠️ Tech Stack

- **Vanilla HTML/CSS/JS** — no framework, no build step
- **Sideforge Design System** — shared tokens across all tools
- **Exportify** — Spotify playlist export as CSV
- **qrcode-generator** — client-side QR code generation
- **jsPDF** — client-side PDF creation
- **GitHub Pages** — free hosting

---

## 📄 License

MIT — free to use, modify and share.

---

Made with ♪ by [kampfmade](https://github.com/c129h223n3o54) | Inspired by the Hitster game | Part of [Sideforge](https://github.com/C129H223N3O54/SideForge)
