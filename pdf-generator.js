// ============================================
// TIMETUNE — pdf-generator.js
// PDF generation with jsPDF
// ============================================

// Card dimensions in mm (standard poker card)
const CARD_W = 63;   // mm
const CARD_H = 89;   // mm

// Page configs
const PAGE_CONFIGS = {
  a4: { w: 210, h: 297 },
  letter: { w: 216, h: 279 },
};

// Grid: 2 columns × 3 rows = 6 cards per page
const COLS = 2;
const ROWS = 3;
const CARDS_PER_PAGE = COLS * ROWS;

// ============================================
// MAIN PDF GENERATION
// ============================================

async function generateCardsPDF(tracks, settings, onProgress) {
  const { jsPDF } = window.jspdf;
  const pageSize = PAGE_CONFIGS[settings.pageformat] || PAGE_CONFIGS.a4;

  // Calculate margins to center the card grid
  const totalCardsW = COLS * CARD_W;
  const totalCardsH = ROWS * CARD_H;
  const marginX = (pageSize.w - totalCardsW) / 2;
  const marginY = (pageSize.h - totalCardsH) / 2;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pageSize.w, pageSize.h],
  });

  let pageCount = 0;

  // Optional: Instruction page
  if (settings.instructions) {
    drawInstructionsPage(doc, pageSize);
    pageCount++;
  }

  // Chunk tracks into groups of 6
  const pages = chunkArray(tracks, CARDS_PER_PAGE);

  // Optional: Blank cards
  const blankCount = settings.blankCards ? 6 : 0;
  if (blankCount > 0) {
    pages.push(new Array(blankCount).fill(null));
  }

  const totalPages = pages.length;
  const printMode = settings.printmode;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageCards = pages[pageIdx];
    const isLastPage = pageIdx === totalPages - 1;

    // FRONT PAGE
    if (printMode !== 'back-only') {
      if (pageCount > 0) doc.addPage();
      pageCount++;

      await drawCardPage(doc, pageCards, true, marginX, marginY, CARD_W, CARD_H, settings, pageSize);

      const pct = ((pageIdx * 2 + 1) / (totalPages * 2)) * 90;
      onProgress(pct, `Vorderseiten: ${pageIdx + 1}/${totalPages}`);
    }

    // BACK PAGE
    if (printMode !== 'front-only') {
      if (pageCount > 0) doc.addPage();
      pageCount++;

      // Duplex: mirror cards horizontally per row
      const backCards = printMode === 'duplex' ? mirrorCardsPerRow(pageCards) : pageCards;

      await drawCardPage(doc, backCards, false, marginX, marginY, CARD_W, CARD_H, settings, pageSize);

      const pct = ((pageIdx * 2 + 2) / (totalPages * 2)) * 90;
      onProgress(pct, `Rückseiten: ${pageIdx + 1}/${totalPages}`);
    }
  }

  onProgress(95, 'Finalisiere PDF...');

  // Download
  await new Promise(r => setTimeout(r, 100));
  const filename = `TimeTune-Karten-${tracks.length}-${Date.now()}.pdf`;
  doc.save(filename);

  onProgress(100, 'Fertig!');
}

// ============================================
// DRAW ONE PAGE (front or back)
// ============================================

async function drawCardPage(doc, cards, isFront, marginX, marginY, cardW, cardH, settings, pageSize) {
  // White page background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageSize.w, pageSize.h, 'F');

  // Cut lines
  if (settings.cutlines) {
    drawCutLines(doc, marginX, marginY, cardW, cardH, pageSize);
  }

  // Draw each card
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = marginX + col * cardW;
    const y = marginY + row * cardH;

    if (!card) {
      // Blank card
      drawBlankCard(doc, x, y, cardW, cardH, isFront, settings);
      continue;
    }

    if (isFront) {
      await drawFrontCard(doc, card, x, y, cardW, cardH, settings);
    } else {
      drawBackCard(doc, card, x, y, cardW, cardH, settings);
    }

    // Small breathing room between async operations
    if (i % 2 === 1) await new Promise(r => setTimeout(r, 0));
  }
}

// ============================================
// CUT LINES
// ============================================

function drawCutLines(doc, marginX, marginY, cardW, cardH, pageSize) {
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.15);

  // Dashed line helper
  function dashedLine(x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const dashLen = 2, gapLen = 1.5;
    let pos = 0;
    while (pos < len) {
      const start = pos / len;
      const end = Math.min((pos + dashLen) / len, 1);
      doc.line(x1 + dx * start, y1 + dy * start, x1 + dx * end, y1 + dy * end);
      pos += dashLen + gapLen;
    }
  }

  // Vertical lines (between cols and at edges)
  for (let col = 0; col <= COLS; col++) {
    const x = marginX + col * cardW;
    dashedLine(x, 0, x, pageSize.h);
  }

  // Horizontal lines (between rows and at edges)
  for (let row = 0; row <= ROWS; row++) {
    const y = marginY + row * cardH;
    dashedLine(0, y, pageSize.w, y);
  }
}

// ============================================
// BLANK CARD
// ============================================

function drawBlankCard(doc, x, y, w, h, isFront, settings) {
  const scheme = COLOR_SCHEMES[settings.colorScheme] || COLOR_SCHEMES.classic;

  if (isFront) {
    // Simple dark background
    drawGradientRect(doc, x, y, w, h, scheme.frontGradient);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(5);
    doc.setGState && doc.setGState(new doc.GState({ opacity: 0.4 }));
    doc.text('♪ TIMETUNE', x + w / 2, y + h / 2, { align: 'center' });
    doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));
  } else {
    const bgRgb = hexToRgb(scheme.backBg);
    doc.setFillColor(bgRgb[0], bgRgb[1], bgRgb[2]);
    doc.rect(x, y, w, h, 'F');

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(5);
    doc.text('Leer / Eigene Karte', x + w / 2, y + h / 2, { align: 'center' });
  }

  if (settings.border) {
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, 2, 2, 'S');
  }
}

// ============================================
// MIRROR CARDS (for duplex print)
// ============================================

function mirrorCardsPerRow(cards) {
  const result = [];
  for (let row = 0; row < ROWS; row++) {
    const rowStart = row * COLS;
    const rowCards = cards.slice(rowStart, rowStart + COLS);
    // Reverse each row
    result.push(...rowCards.reverse());
  }
  return result;
}

// ============================================
// INSTRUCTIONS PAGE
// ============================================

function drawInstructionsPage(doc, pageSize) {
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, pageSize.w, pageSize.h, 'F');

  // Title
  doc.setTextColor(233, 69, 96);
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  doc.text('TimeTune', pageSize.w / 2, 30, { align: 'center' });

  doc.setTextColor(200, 200, 220);
  doc.setFontSize(14);
  doc.setFont(undefined, 'normal');
  doc.text('Spielanleitung', pageSize.w / 2, 42, { align: 'center' });

  // Divider
  doc.setDrawColor(233, 69, 96);
  doc.setLineWidth(0.5);
  doc.line(40, 48, pageSize.w - 40, 48);

  const steps = [
    ['1. Ziel', 'Ordne die Musikkarten chronologisch auf deiner persoenlichen Musik-Zeitlinie ein.'],
    ['2. Vorbereitung', 'Mische alle Karten und lege sie verdeckt in einen Stapel. Die erste Karte wird aufgedeckt und bildet den Start der Zeitlinie.'],
    ['3. Spielzug', 'Decke eine Karte auf. Schaetze, in welchem Jahr der Song erschienen ist, und lege die Karte an die richtige Stelle in die Zeitlinie.'],
    ['4. Aufloesung', 'Drehe die Karte um und ueberpruefe das Jahr. Lag sie richtig? Du darfst sie behalten. Falsch? Sie wandert zurueck.'],
    ['5. Gewinner', 'Wer zuerst eine festgelegte Anzahl Karten gesammelt hat (z. B. 10), gewinnt!'],
    ['6. QR-Code', 'Scanne den QR-Code auf der Vorderseite mit deinem Smartphone, um den Song direkt auf Spotify zu hoeren.'],
  ];

  let y = 62;
  steps.forEach(([title, desc]) => {
    doc.setTextColor(233, 69, 96);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(title, 20, y);

    doc.setTextColor(180, 180, 200);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(desc, pageSize.w - 40);
    doc.text(lines, 20, y + 6);
    y += 18 + (lines.length - 1) * 4;
  });

  // Footer
  doc.setTextColor(100, 100, 120);
  doc.setFontSize(7);
  doc.text('Erstellt mit TimeTune', pageSize.w / 2, pageSize.h - 12, { align: 'center' });
}

// ============================================
// UTILS
// ============================================

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
