// ============================================
// TIMETUNE — card-generator.js
// Card rendering helpers for PDF generation
// ============================================

// Decade color mapping
function getDecadeColorForYear(year) {
  if (!year) return '#555555';
  if (year < 1960) return '#8B7355';
  if (year < 1970) return '#FF6B35';
  if (year < 1980) return '#FFD700';
  if (year < 1990) return '#FF1493';
  if (year < 2000) return '#00E676';
  if (year < 2010) return '#2196F3';
  if (year < 2020) return '#9C27B0';
  return '#FF1744';
}

// Color schemes
const COLOR_SCHEMES = {
  classic: {
    frontBg: null, // uses gradient
    frontGradient: ['#0f0c29', '#302b63', '#24243e'],
    backBg: '#1a1a2e',
    accentColor: '#f5a623',
    textColor: '#ffffff',
    subtextColor: '#b3b3b3',
    logoColor: 'rgba(255,255,255,0.5)',
    borderColor: 'rgba(245,166,35,0.4)',
    qrBg: '#ffffff',
    qrFg: '#000000',
  },
  minimal: {
    frontGradient: ['#111111', '#222222', '#111111'],
    backBg: '#111111',
    accentColor: '#ffffff',
    textColor: '#ffffff',
    subtextColor: '#aaaaaa',
    logoColor: 'rgba(255,255,255,0.4)',
    borderColor: 'rgba(255,255,255,0.2)',
    qrBg: '#ffffff',
    qrFg: '#000000',
  },
  vintage: {
    frontGradient: ['#3d2b1f', '#6b4c35', '#3d2b1f'],
    backBg: '#2a1f14',
    accentColor: '#d4a96a',
    textColor: '#f0e6d3',
    subtextColor: '#c4a882',
    logoColor: 'rgba(212,169,106,0.6)',
    borderColor: 'rgba(212,169,106,0.5)',
    qrBg: '#f0e6d3',
    qrFg: '#2a1f14',
  },
  neon: {
    frontGradient: ['#000000', '#0a000a', '#000000'],
    backBg: '#000000',
    accentColor: '#ff00ff',
    textColor: '#ffffff',
    subtextColor: '#cc00cc',
    logoColor: 'rgba(255,0,255,0.6)',
    borderColor: 'rgba(255,0,255,0.5)',
    qrBg: '#ffffff',
    qrFg: '#000000',
  },
};

// Generate QR code as data URL
async function generateQRDataURL(text, size, scheme) {
  const colors = COLOR_SCHEMES[scheme] || COLOR_SCHEMES.classic;

  return new Promise((resolve, reject) => {
    const tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);

    try {
      const qrInstance = new QRCode(tempDiv, {
        text: text,
        width: size,
        height: size,
        colorDark: colors.qrFg,
        colorLight: colors.qrBg,
        correctLevel: QRCode.CorrectLevel.M,
      });

      setTimeout(() => {
        const canvas = tempDiv.querySelector('canvas');
        const img = tempDiv.querySelector('img');

        let dataUrl = null;
        if (canvas) {
          dataUrl = canvas.toDataURL('image/png');
        } else if (img) {
          dataUrl = img.src;
        }

        document.body.removeChild(tempDiv);
        if (dataUrl) resolve(dataUrl);
        else reject(new Error('QR generation failed'));
      }, 100);
    } catch (e) {
      document.body.removeChild(tempDiv);
      reject(e);
    }
  });
}

// Draw gradient rectangle on jsPDF canvas
function drawGradientRect(doc, x, y, w, h, colors) {
  // jsPDF doesn't support gradients natively, simulate with stripes
  const steps = 20;
  const stepH = h / steps;

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const c = lerpColors(colors, t);
    doc.setFillColor(c[0], c[1], c[2]);
    doc.rect(x, y + i * stepH, w, stepH + 0.5, 'F');
  }
}

function lerpColors(hexColors, t) {
  // For 3 colors (gradient stops at 0, 0.5, 1)
  let i, localT;
  if (hexColors.length === 2) {
    i = 0; localT = t;
  } else if (hexColors.length === 3) {
    if (t < 0.5) { i = 0; localT = t * 2; }
    else { i = 1; localT = (t - 0.5) * 2; }
  } else {
    i = 0; localT = t;
  }

  const c1 = hexToRgb(hexColors[i]);
  const c2 = hexToRgb(hexColors[Math.min(i + 1, hexColors.length - 1)]);

  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * localT),
    Math.round(c1[1] + (c2[1] - c1[1]) * localT),
    Math.round(c1[2] + (c2[2] - c1[2]) * localT),
  ];
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexToRgbObj(hex) {
  const [r, g, b] = hexToRgb(hex);
  return { r, g, b };
}

// ============================================
// DRAW FRONT CARD on jsPDF
// ============================================
async function drawFrontCard(doc, track, x, y, w, h, settings) {
  const scheme = COLOR_SCHEMES[settings.colorScheme] || COLOR_SCHEMES.classic;

  // Background gradient
  drawGradientRect(doc, x, y, w, h, scheme.frontGradient);

  // Notes pattern: disabled in PDF (font rendering issues)

  // QR Code
  try {
    const qrSize = settings.qrsize === 'large' ? Math.min(w, h) * 0.65 : Math.min(w, h) * 0.55;
    const qrX = x + (w - qrSize) / 2;
    const qrY = y + h * 0.10;

    // White background box for QR
    const padding = 2;
    const { r, g, b } = hexToRgbObj(scheme.qrBg);
    doc.setFillColor(r, g, b);
    doc.roundedRect(qrX - padding, qrY - padding, qrSize + padding * 2, qrSize + padding * 2, 2, 2, 'F');

    // QR data URL
    const qrDataUrl = await generateQRDataURL(track.spotifyUrl, 200, settings.colorScheme);
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  } catch (e) {
    console.warn('QR error for', track.id, e);
    // Fallback: text QR placeholder
    doc.setFillColor(255, 255, 255);
    doc.rect(x + w * 0.2, y + h * 0.1, w * 0.6, w * 0.6, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(5);
    doc.text('SCAN', x + w / 2, y + h * 0.1 + w * 0.3, { align: 'center' });
  }

  // Divider line
  const divY = y + h * 0.78;
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.setGState && doc.setGState(new doc.GState({ opacity: 0.25 }));
  doc.line(x + w * 0.15, divY, x + w * 0.85, divY);
  doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));

  // Logo
  doc.setFontSize(settings.fontsize === 'large' ? 8 : 6.5);
  doc.setTextColor(255, 255, 255);
  doc.setGState && doc.setGState(new doc.GState({ opacity: 0.85 }));
  doc.text('TimeTune', x + w / 2, y + h * 0.93, { align: 'center' });
  doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));

  // Border
  if (settings.border) {
    const bRgb = hexToRgb(scheme.borderColor.replace(/rgba\([^)]+\)/, '#f5a623'));
    doc.setDrawColor(245, 166, 35);
    doc.setLineWidth(0.3);
    doc.setGState && doc.setGState(new doc.GState({ opacity: 0.4 }));
    doc.roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, 2, 2, 'S');
    doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));
  }
}

// ============================================
// DRAW BACK CARD on jsPDF
// ============================================
function drawBackCard(doc, track, x, y, w, h, settings) {
  const scheme = COLOR_SCHEMES[settings.colorScheme] || COLOR_SCHEMES.classic;
  const decadeColor = getDecadeColorForYear(track.year);
  const yearDisplay = track.year ? String(track.year) : '????';

  // Background
  const bgRgb = hexToRgb(scheme.backBg);
  doc.setFillColor(bgRgb[0], bgRgb[1], bgRgb[2]);
  doc.rect(x, y, w, h, 'F');

  // Vinyl circle watermark
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.25);
  doc.setGState && doc.setGState(new doc.GState({ opacity: 0.08 }));
  const cx = x + w / 2, cy = y + h * 0.54;
  for (let r = 2.5; r <= 14; r += 2.5) doc.circle(cx, cy, r, 'S');
  doc.circle(cx, cy, 1.2, 'S');
  doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));

  // Decade color bar (top)
  if (settings.decadeBar) {
    const dRgb = hexToRgb(decadeColor);
    doc.setFillColor(dRgb[0], dRgb[1], dRgb[2]);
    doc.rect(x, y, w, h * 0.07, 'F');
  }

  const fs = settings.fontsize === 'large' ? 1.3 : 1.0;

  // Artist
  const artistRgb = hexToRgb(scheme.textColor);
  doc.setTextColor(artistRgb[0], artistRgb[1], artistRgb[2]);
  doc.setFontSize(Math.max(6, Math.min(9, w / 8)) * fs);
  doc.setFont(undefined, 'bold');
  const artistLines = splitTextToFit(doc, track.artist, w - 4);
  let textY = y + h * 0.17;
  artistLines.slice(0, 2).forEach(line => {
    doc.text(line, x + w / 2, textY, { align: 'center' });
    textY += doc.getFontSize() * 0.45;
  });

  // Song title
  const titleRgb = hexToRgb(scheme.subtextColor);
  doc.setTextColor(titleRgb[0], titleRgb[1], titleRgb[2]);
  doc.setFontSize(Math.max(5, Math.min(7.5, w / 10)) * fs);
  doc.setFont(undefined, 'normal');
  const titleLines = splitTextToFit(doc, track.name, w - 4);
  titleLines.slice(0, 2).forEach(line => {
    doc.text(line, x + w / 2, textY + 1, { align: 'center' });
    textY += doc.getFontSize() * 0.42;
  });

  // Album (optional)
  if (settings.album && track.album) {
    const albRgb = hexToRgb(scheme.subtextColor);
    doc.setTextColor(albRgb[0], albRgb[1], albRgb[2]);
    doc.setFontSize(Math.max(4, Math.min(6, w / 13)) * fs);
    doc.setGState && doc.setGState(new doc.GState({ opacity: 0.7 }));
    const albLines = splitTextToFit(doc, track.album, w - 4);
    doc.text(albLines[0] || '', x + w / 2, textY + 2, { align: 'center' });
    doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));
    textY += 4;
  }

  // YEAR (the hero element)
  const yearFontSize = settings.fontsize === 'large' ? 28 : 22;
  const whiteRgb = hexToRgb(scheme.textColor);
  doc.setTextColor(whiteRgb[0], whiteRgb[1], whiteRgb[2]);
  doc.setFontSize(yearFontSize);
  doc.setFont(undefined, 'bold');
  const yearY = y + h * 0.80;
  doc.text(yearDisplay, x + w / 2, yearY, { align: 'center' });

  // Logo (bottom)
  const logoRgb = hexToRgb(scheme.logoColor.replace(/rgba\([^,]+,[^,]+,[^,]+,([^)]+)\)/, '#888888'));
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(4.5 * fs);
  doc.setFont(undefined, 'normal');
  doc.setGState && doc.setGState(new doc.GState({ opacity: 0.5 }));
  doc.text('TimeTune', x + w / 2, y + h * 0.93, { align: 'center' });
  doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));

  // Border
  if (settings.border) {
    doc.setDrawColor(245, 166, 35);
    doc.setLineWidth(0.3);
    doc.setGState && doc.setGState(new doc.GState({ opacity: 0.3 }));
    doc.roundedRect(x + 0.5, y + 0.5, w - 1, h - 1, 2, 2, 'S');
    doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));
  }

  // Reset font
  doc.setFont(undefined, 'normal');
}

// ============================================
// HELPERS
// ============================================

function splitTextToFit(doc, text, maxWidth) {
  if (!text) return [''];
  const words = text.split(' ');
  const lines = [];
  let line = '';

  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (doc.getTextWidth(test) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}
