// ============================================
// TIMETUNE — app.js
// CSV Import (via Exportify) — kein Spotify API nötig
// ============================================

const state = {
  tracks: [],
  filteredTracks: [],
  selectedIds: new Set(),
  playlistName: '',
  settings: {
    colorScheme: 'classic',
    fontsize: 'normal',
    qrsize: 'normal',
    printmode: 'duplex',
    pageformat: 'a4',
    border: true,
    notes: true,
    decadeBar: true,
    album: true,
    cutlines: true,
    instructions: false,
    blankCards: false,
    customText: '',
  },
  customTexts: {}, // per-track custom text
};

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

// ============================================
// CSV PARSING
// ============================================

function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) throw new Error('CSV leer oder ungültig');

  const header = parseCSVLine(lines[0]);

  const idx = {
    name:    findCol(header, ['Track Name', 'name', 'title', 'song']),
    artist:  findCol(header, ['Artist Name(s)', 'Artist Name', 'artist', 'artists', 'performer']),
    album:   findCol(header, ['Album Name', 'album']),
    date:    findCol(header, ['Release Date', 'release_date', 'year', 'date']),
    uri:     findCol(header, ['Track URI', 'Spotify URI', 'uri', 'Track ID', 'id']),
    url:     findCol(header, ['Spotify URL', 'Track URL', 'url']),
  };

  const tracks = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseCSVLine(line);
    if (cols.length < 2) continue;

    const name = (cols[idx.name] || '').trim();
    const artist = (cols[idx.artist] || '').trim();
    if (!name && !artist) continue;

    const releaseRaw = (cols[idx.date] || '').trim();
    const yearMatch = releaseRaw.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

    // Build Spotify URL from URI or URL column
    let spotifyUrl = (cols[idx.url] || '').trim();
    if (!spotifyUrl) {
      const uri = (cols[idx.uri] || '').trim();
      const idMatch = uri.match(/([a-zA-Z0-9]{22})$/);
      if (idMatch) spotifyUrl = `https://open.spotify.com/track/${idMatch[1]}`;
      else if (uri.startsWith('http')) spotifyUrl = uri;
    }

    // Fallback: search URL
    if (!spotifyUrl) {
      spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(artist + ' ' + name)}`;
    }

    // Extract Spotify Track ID for Hitster QR codes
    const trackIdMatch = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/);
    const hitsterUrl = trackIdMatch
      ? `https://hitster.app/song/${trackIdMatch[1]}`
      : spotifyUrl;

    tracks.push({
      id: `t${i}-${Math.random().toString(36).substr(2,5)}`,
      name,
      artist,
      album: (cols[idx.album] || '').trim(),
      year,
      spotifyUrl,
      hitsterUrl,
    });
  }
  return tracks;
}

function findCol(header, candidates) {
  for (const c of candidates) {
    const i = header.findIndex(h => h.toLowerCase().trim() === c.toLowerCase());
    if (i !== -1) return i;
  }
  for (const c of candidates) {
    const i = header.findIndex(h => h.toLowerCase().includes(c.toLowerCase()));
    if (i !== -1) return i;
  }
  return 0;
}

function parseCSVLine(line) {
  const cols = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i+1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      cols.push(cur); cur = '';
    } else cur += ch;
  }
  cols.push(cur);
  return cols;
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // DROP ZONE
  const fileInput = document.getElementById('csv-file-input');
  const dropZone  = document.getElementById('drop-zone');

  fileInput?.addEventListener('change', e => {
    if (e.target.files[0]) handleCSVFile(e.target.files[0]);
  });

  dropZone?.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone?.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleCSVFile(e.dataTransfer.files[0]);
  });
  dropZone?.addEventListener('click', () => fileInput?.click());

  // SORT / SEARCH / YEAR
  document.getElementById('sort-select')?.addEventListener('change', applyFilterAndSort);
  document.getElementById('search-input')?.addEventListener('input', applyFilterAndSort);
  document.getElementById('apply-year-filter-btn')?.addEventListener('click', applyFilterAndSort);
  document.getElementById('reset-year-filter-btn')?.addEventListener('click', () => {
    document.getElementById('year-from').value = '';
    document.getElementById('year-to').value = '';
    applyFilterAndSort();
  });

  // SELECT / DESELECT / RANDOM
  document.getElementById('select-all-btn')?.addEventListener('click', () => {
    state.filteredTracks.forEach(t => state.selectedIds.add(t.id));
    renderCards(); updateStats();
  });
  document.getElementById('deselect-all-btn')?.addEventListener('click', () => {
    state.selectedIds.clear(); renderCards(); updateStats();
  });
  document.getElementById('random-btn')?.addEventListener('click', () => {
    document.getElementById('random-modal').classList.remove('hidden');
    document.getElementById('random-count-input').value = Math.min(50, state.tracks.length);
  });
  document.getElementById('random-cancel-btn')?.addEventListener('click', () =>
    document.getElementById('random-modal').classList.add('hidden'));
  document.getElementById('random-confirm-btn')?.addEventListener('click', () => {
    const n = parseInt(document.getElementById('random-count-input').value, 10);
    if (!isNaN(n) && n > 0) {
      state.selectedIds = new Set([...state.filteredTracks].sort(() => Math.random()-.5).slice(0,n).map(t=>t.id));
      renderCards(); updateStats();
    }
    document.getElementById('random-modal').classList.add('hidden');
  });

  // COLOR SCHEME
  document.querySelectorAll('.radio-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.radio-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      state.settings.colorScheme = opt.dataset.scheme;
      renderCards();
    });
  });

  // TOGGLE BUTTONS
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll(`.toggle-btn[data-setting="${btn.dataset.setting}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.settings[btn.dataset.setting] = btn.dataset.value;
      updateStats();
    });
  });

  // CHECKBOXES
  const cbs = {
    'opt-border':     'border',
    'opt-notes':      'notes',
    'opt-decade-bar': 'decadeBar',
    'opt-album':      'album',
    'opt-cutlines':   'cutlines',
    'opt-instructions':'instructions',
    'opt-blank-cards':'blankCards',
  };
  Object.entries(cbs).forEach(([id, key]) => {
    document.getElementById(id)?.addEventListener('change', e => {
      state.settings[key] = e.target.checked;
      if (['border','notes','decadeBar','album'].includes(key)) renderCards();
    });
  });

  // Global custom text -> apply to all cards that have no individual text
  document.getElementById('opt-custom-text')?.addEventListener('input', e => {
    state.settings.customText = e.target.value;
    // Update all card inputs that are still empty
    document.querySelectorAll('.card-custom-input').forEach(input => {
      const id = input.dataset.trackId;
      if (!state.customTexts[id]) input.placeholder = e.target.value || 'Custom text...';
    });
  });

  // Per-card custom text (event delegation on grid)
  document.getElementById('cards-grid')?.addEventListener('input', e => {
    if (e.target.classList.contains('card-custom-input')) {
      e.stopPropagation();
      const id = e.target.dataset.trackId;
      state.customTexts[id] = e.target.value;
    }
  });
  document.getElementById('cards-grid')?.addEventListener('click', e => {
    if (e.target.classList.contains('card-custom-input')) {
      e.stopPropagation();
    }
  });

  // PDF
  document.getElementById('generate-pdf-btn')?.addEventListener('click', generatePDF);
}

// ============================================
// HANDLE CSV FILE
// ============================================

async function handleCSVFile(file) {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    showToast('Bitte eine CSV-Datei hochladen', 'error'); return;
  }
  try {
    const text = await file.text();
    const tracks = parseCSV(text);

    if (tracks.length === 0) {
      showToast('Keine Songs in der CSV gefunden', 'error'); return;
    }

    state.tracks = tracks;
    state.playlistName = file.name.replace(/\.csv$/i, '');
    state.selectedIds = new Set(tracks.map(t => t.id));

    const noYear = tracks.filter(t => !t.year).length;
    if (noYear > 0) showToast(`⚠️ ${noYear} Songs ohne Jahr`, 'info');

    // Show tracks section, hide login
    document.getElementById('section-login').classList.add('hidden');
    document.getElementById('section-tracks').classList.remove('hidden');

    // Update info bar
    const bar = document.getElementById('playlist-info-bar');
    if (bar) {
      bar.textContent = `📋 ${state.playlistName} · ${tracks.length} Songs`;
      bar.classList.remove('hidden');
    }

    applyFilterAndSort();
    showToast(`${tracks.length} Songs geladen ✓`, 'success');

  } catch(e) {
    console.error(e);
    showToast('Fehler beim Lesen der CSV: ' + e.message, 'error');
  }
}

// ============================================
// FILTER & SORT
// ============================================

function applyFilterAndSort() {
  const search  = (document.getElementById('search-input')?.value || '').toLowerCase();
  const sortBy  = document.getElementById('sort-select')?.value || 'playlist';
  const yearFrom = parseInt(document.getElementById('year-from')?.value, 10) || null;
  const yearTo   = parseInt(document.getElementById('year-to')?.value, 10)   || null;

  let filtered = [...state.tracks];
  if (search) filtered = filtered.filter(t =>
    t.name.toLowerCase().includes(search) || t.artist.toLowerCase().includes(search) ||
    t.album.toLowerCase().includes(search) || String(t.year).includes(search));
  if (yearFrom) filtered = filtered.filter(t => t.year >= yearFrom);
  if (yearTo)   filtered = filtered.filter(t => t.year <= yearTo);

  switch(sortBy) {
    case 'year-asc':  filtered.sort((a,b) => (a.year||9999)-(b.year||9999)); break;
    case 'year-desc': filtered.sort((a,b) => (b.year||0)-(a.year||0)); break;
    case 'artist':    filtered.sort((a,b) => a.artist.localeCompare(b.artist)); break;
    case 'title':     filtered.sort((a,b) => a.name.localeCompare(b.name)); break;
  }

  state.filteredTracks = filtered;
  renderCards();
  updateStats();
}

// ============================================
// RENDER CARDS
// ============================================

function renderCards() {
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = '';
  if (!state.filteredTracks.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px 0;">Keine Karten gefunden</p>';
    return;
  }
  state.filteredTracks.forEach(t => grid.appendChild(createCardPreviewElement(t)));
}

function createCardPreviewElement(track) {
  const isSelected = state.selectedIds.has(track.id);
  const wrapper = document.createElement('div');
  wrapper.className = `card-preview-wrapper${isSelected ? '' : ' deselected'}`;
  wrapper.dataset.id = track.id;
  wrapper.innerHTML = `
    <input type="checkbox" class="card-checkbox" ${isSelected ? 'checked' : ''} />
    <div class="card-preview">
      <div class="card-inner">
        <div class="card-face card-front">${buildFrontHTML(track)}</div>
        <div class="card-face card-back">${buildBackHTML(track)}</div>
      </div>
    </div>`;

  setTimeout(() => generateQRCodeForCard(wrapper, track), 0);
  wrapper.querySelector('.card-front').addEventListener('click', () => wrapper.classList.add('flipped'));
  wrapper.querySelector('.card-back-preview').addEventListener('click', (e) => {
    if (!e.target.classList.contains('card-custom-input')) wrapper.classList.remove('flipped');
  });
  const cb = wrapper.querySelector('.card-checkbox');
  cb.addEventListener('change', e => {
    e.stopPropagation();
    if (e.target.checked) { state.selectedIds.add(track.id); wrapper.classList.remove('deselected'); }
    else { state.selectedIds.delete(track.id); wrapper.classList.add('deselected'); }
    updateStats();
  });
  cb.addEventListener('click', e => e.stopPropagation());
  return wrapper;
}

function buildFrontHTML(track) {
  const bgs = { classic:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', minimal:'linear-gradient(135deg,#111,#333)', vintage:'linear-gradient(135deg,#3d2b1f,#6b4c35)', neon:'linear-gradient(135deg,#000,#0d0d0d)' };
  const bg = bgs[state.settings.colorScheme] || bgs.classic;
  return `<div class="card-front-preview" style="background:${bg};">

    <div class="card-qr-container" id="qr-${track.id}"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:9px;">QR</div></div>
    <div class="card-front-logo">TimeTune</div>
    ${state.settings.border ? '<div style="position:absolute;inset:2px;border:1px solid rgba(255,200,0,0.25);border-radius:7px;pointer-events:none;"></div>' : ''}
  </div>`;
}

function buildBackHTML(track) {
  const bgs = { classic:'#1a1a2e', minimal:'#111', vintage:'#2a1f14', neon:'#000' };
  const bg = bgs[state.settings.colorScheme] || bgs.classic;
  const dc = getDecadeColor(track.year);
  return `<div class="card-back-preview" style="background:${bg};">
    ${state.settings.decadeBar ? `<div class="card-decade-bar" style="background:${dc};"></div>` : ''}
    <div class="card-back-content">
      <div class="card-vinyl-bg" style="width:50px;height:50px;opacity:0.06;"></div>
      <div class="card-artist-preview">${escHtml(track.artist)}</div>
      <div class="card-title-preview">${escHtml(track.name)}</div>
      ${state.settings.album ? `<div class="card-title-preview" style="font-size:7px;opacity:.6;">${escHtml(track.album)}</div>` : ''}
      <div class="card-year-preview">${track.year || '????'}</div>
      <div class="card-back-logo">TimeTune</div>
    </div>
    ${state.settings.border ? '<div style="position:absolute;inset:2px;border:1px solid rgba(255,200,0,0.15);border-radius:7px;pointer-events:none;"></div>' : ''}
  </div>`;
}

async function generateQRCodeForCard(wrapper, track) {
  const container = wrapper.querySelector(`#qr-${track.id}`);
  if (!container) return;
  container.innerHTML = '';
  try {
    new QRCode(container, { text: track.spotifyUrl, width: container.offsetWidth||80, height: container.offsetHeight||80, colorDark:'#000', colorLight:'#fff', correctLevel: QRCode.CorrectLevel.M });
  } catch(e) {
    container.innerHTML = `<div style="font-size:8px;color:#999;text-align:center;padding:4px;">${track.year||'??'}</div>`;
  }
}

// ============================================
// STATS
// ============================================

function updateStats() {
  const total = [...state.selectedIds].filter(id => state.tracks.find(t => t.id === id)).length;
  document.getElementById('selected-count').textContent = total;
  document.getElementById('stat-selected').textContent = total;
  const pages = Math.ceil(total / 6);
  document.getElementById('stat-pages').textContent = pages;
  const pm = state.settings.printmode;
  document.getElementById('stat-print-info').textContent =
    pm === 'front-only' || pm === 'back-only' ? pages : pages * 2;
}

// ============================================
// PDF
// ============================================

async function generatePDF() {
  const selected = state.tracks.filter(t => state.selectedIds.has(t.id));
  if (!selected.length) { showToast('Keine Karten ausgewählt', 'error'); return; }
  if (selected.length > 200 && !confirm(`${selected.length} Karten — wirklich generieren?`)) return;

  const progress = document.getElementById('progress-container');
  progress.classList.remove('hidden');
  document.getElementById('generate-pdf-btn').disabled = true;

  try {
    const settingsWithTexts = { ...state.settings, customTexts: state.customTexts };
    await generateCardsPDF(selected, settingsWithTexts, (pct, text) => {
      document.getElementById('progress-fill').style.width = pct + '%';
      document.getElementById('progress-percent').textContent = Math.round(pct) + '%';
      document.getElementById('progress-text').textContent = text || 'PDF wird erstellt...';
    });
    showToast('PDF erstellt & heruntergeladen! 🎉', 'success');
  } catch(e) {
    console.error(e);
    showToast('Fehler: ' + e.message, 'error');
  } finally {
    document.getElementById('generate-pdf-btn').disabled = false;
    setTimeout(() => progress.classList.add('hidden'), 3000);
  }
}

// ============================================
// HELPERS
// ============================================

function getDecadeColor(year) {
  if (!year) return '#555';
  if (year < 1960) return '#8B7355';
  if (year < 1970) return '#FF6B35';
  if (year < 1980) return '#FFD700';
  if (year < 1990) return '#FF1493';
  if (year < 2000) return '#00E676';
  if (year < 2010) return '#2196F3';
  if (year < 2020) return '#9C27B0';
  return '#FF1744';
}

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type='info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast toast-${type} visible`;
  clearTimeout(t._to);
  t._to = setTimeout(() => t.classList.remove('visible'), 3500);
}
