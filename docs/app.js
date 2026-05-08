const REPO_OWNER = "aliyanamu";
const REPO_NAME = "career-ops";
const BRANCH = "main";
const FILE_PATH = "Job_Hunting_Progress.xlsx";

const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(FILE_PATH)}`;

const $ = (id) => document.getElementById(id);
const setStatus = (msg) => { $("status").textContent = msg; };

// ---------- PAT management ----------
function getPat() {
  let pat = localStorage.getItem("gh_pat");
  if (!pat) {
    pat = prompt("Paste your GitHub Personal Access Token (stored only in this browser):");
    if (pat) localStorage.setItem("gh_pat", pat.trim());
  }
  return pat;
}

function logout() {
  if (confirm("Forget the saved token on this device?")) {
    localStorage.removeItem("gh_pat");
    location.reload();
  }
}

// ---------- State ----------
let workbook = null;
let currentSha = null;
let activeSheetName = null;
const dirtyCells = new Set();
let showHiddenJobs = false; // toggle for Jobs sheet "Hide" column filter

// ---------- Load xlsx from GitHub ----------
async function loadWorkbook() {
  const pat = getPat();
  if (!pat) return;
  setStatus("Loading…");
  try {
    const res = await fetch(`${API_BASE}?ref=${BRANCH}`, {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const meta = await res.json();
    currentSha = meta.sha;

    // Decode base64 content into a buffer
    const binary = atob(meta.content.replace(/\s/g, ""));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(bytes.buffer);

    activeSheetName = sheetFromHash() || workbook.worksheets[0].name;
    writeHashFromSheet(activeSheetName);
    dirtyCells.clear();
    renderTabs();
    renderSheet();
    setStatus("Loaded");
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
    alert(`Failed to load:\n${err.message}\n\nIs your PAT valid?`);
  }
}

// ---------- URL hash <-> active sheet ----------
function sheetFromHash() {
  if (!workbook) return null;
  const m = location.hash.match(/^#sheet=(.+)$/);
  if (!m) return null;
  const wanted = decodeURIComponent(m[1]);
  return workbook.worksheets.find((ws) => ws.name === wanted)?.name || null;
}

function writeHashFromSheet(name) {
  const next = `#sheet=${encodeURIComponent(name)}`;
  if (location.hash !== next) history.replaceState(null, "", next);
}

window.addEventListener("hashchange", () => {
  const wanted = sheetFromHash();
  if (wanted && wanted !== activeSheetName) {
    activeSheetName = wanted;
    renderTabs();
    renderSheet();
  }
});

// ---------- Sheet column schema ----------
// Single source of truth for every column index in every sheet.
// Update here when columns are added, removed, or reordered.
const SCHEMA = {
  Jobs: {
    num:       1,
    dateAdded: 2,
    company:   3,
    role:      4,
    url:       5,
    source:    6,
    elig:      7,
    why:       8,
    fitScore:  9,
    deadline:  10,
    decision:  11,
    hide:      12,
    notes:     13,
  },
  Preparations: {
    num:              1,
    date:             2,
    company:          3,
    role:             4,
    jobUrl:           5,
    cvPath:           6,
    cvStatus:         7,
    qa:               8,
    videoRequired:    9,
    videoNotes:       10,
    videoStatus:      11,
    aiDisclaimer:     12,
    submissionStatus: 13,
    notes:            14,
  },
  Applications: {
    num:         1,
    dateApplied: 2,
    company:     3,
    role:        4,
    location:    5,
    source:      6,
    jobUrl:      7,
    status:      8,
    lastUpdate:  9,
    cvUsed:      10,
    coverLetter: 11,
    appLink:     12,
    salary:      13,
    contact:     14,
    nextAction:  15,
    followUpDate:16,
    notes:       17,
  },
};

// ---------- Rendering ----------
const JOBS_HIDE_COL = SCHEMA.Jobs.hide;

function countHiddenJobs() {
  const ws = workbook?.getWorksheet("Jobs");
  if (!ws) return 0;
  let n = 0;
  for (let r = 2; r <= ws.rowCount; r++) {
    const v = readCellAsString(ws.getRow(r).getCell(JOBS_HIDE_COL)).trim().toLowerCase();
    if (v === "hidden") n++;
  }
  return n;
}

function renderTabs() {
  const tabs = $("tabs");
  tabs.innerHTML = "";
  workbook.worksheets.forEach((ws) => {
    const btn = document.createElement("button");
    btn.textContent = ws.name;
    if (ws.name === activeSheetName) btn.classList.add("active");
    btn.onclick = () => {
      activeSheetName = ws.name;
      writeHashFromSheet(ws.name);
      renderTabs();
      renderSheet();
    };
    tabs.appendChild(btn);
  });

  // "Show hidden" toggle — only on Jobs sheet
  if (activeSheetName === "Jobs") {
    const hiddenCount = countHiddenJobs();
    if (hiddenCount > 0) {
      const toggle = document.createElement("button");
      toggle.className = "tabs-toggle";
      toggle.textContent = showHiddenJobs
        ? `Hide hidden (${hiddenCount})`
        : `Show hidden (${hiddenCount})`;
      toggle.title = "Toggle visibility of Jobs rows marked Hidden";
      toggle.onclick = () => {
        showHiddenJobs = !showHiddenJobs;
        renderTabs();
        renderSheet();
      };
      tabs.appendChild(toggle);
    }
  }
}

function renderSheet() {
  const ws = workbook.getWorksheet(activeSheetName);
  const container = $("sheet");
  container.innerHTML = "";

  if (!ws || ws.rowCount === 0) {
    container.innerHTML = `<p class="loading">Empty sheet</p>`;
    return;
  }

  const maxCol = ws.columnCount;
  const lastRow = lastNonEmptyRow(ws, maxCol);
  if (lastRow < 1) {
    container.innerHTML = `<p class="loading">Empty sheet</p>`;
    return;
  }

  const table = document.createElement("table");

  const colgroup = document.createElement("colgroup");
  for (let c = 1; c <= maxCol; c++) {
    const col = document.createElement("col");
    const xlsxCol = ws.getColumn(c);
    const w = xlsxCol.width ? Math.round(xlsxCol.width * 7) : 140;
    col.style.width = `${w}px`;
    colgroup.appendChild(col);
  }
  table.appendChild(colgroup);

  const thead = document.createElement("thead");
  const headerTr = document.createElement("tr");
  for (let c = 1; c <= maxCol; c++) {
    const th = document.createElement("th");
    th.dataset.col = c;
    const labelSpan = document.createElement("span");
    labelSpan.className = "th-label";
    labelSpan.textContent = renderCell(ws.getRow(1).getCell(c), 1);
    th.appendChild(labelSpan);
    th.classList.add("sortable");
    th.addEventListener("click", (e) => {
      if (e.target.classList.contains("col-resize")) return;
      handleHeaderClick(c);
    });
    th.appendChild(makeColResizer(colgroup.children[c - 1], c));
    headerTr.appendChild(th);
  }
  thead.appendChild(headerTr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const hideJobsFilter = activeSheetName === "Jobs" && !showHiddenJobs;
  for (let r = 2; r <= lastRow; r++) {
    const xlsxRow = ws.getRow(r);
    if (hideJobsFilter) {
      const hideVal = readCellAsString(xlsxRow.getCell(JOBS_HIDE_COL)).trim().toLowerCase();
      if (hideVal === "hidden") continue;
    }
    const tr = document.createElement("tr");
    if (xlsxRow.height) tr.style.height = `${Math.round(xlsxRow.height * 1.33)}px`;

    for (let c = 1; c <= maxCol; c++) {
      const td = document.createElement("td");
      const cell = xlsxRow.getCell(c);
      td.dataset.row = r;
      td.dataset.col = c;

      if (isFormulaCell(cell)) {
        td.textContent = renderCell(cell, r);
        td.classList.add("formula");
        td.title = `Formula: =${cell.value.formula} (read-only)`;
      } else {
        const validation = getCellValidation(ws, r, c);
        if (validation && validation.type === "list") {
          td.appendChild(makeDropdown(validation, renderCell(cell, r), r, c));
        } else {
          const text = renderCell(cell, r);
          if (REPO_PATH_RE.test(text)) {
            makePathCell(td, text, r, c);
          } else {
            td.textContent = text;
            td.contentEditable = "true";
            td.addEventListener("blur", onCellEdit);
          }
        }
      }
      if (c === 1) td.appendChild(makeRowResizer(tr, r));
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);

  applySort();
}

// ---------- Column sort (DOM-only; workbook untouched) ----------
const sortState = {}; // { sheetName: { col, dir: 'asc'|'desc' } }

function getSortValue(cell) {
  if (cell == null) return "";
  const v = cell.value;
  if (v == null) return "";
  if (v instanceof Date) return v.getTime();
  if (typeof v === "object") {
    if ("result" in v && v.result != null) return v.result;
    if ("text" in v) return v.text;
    if ("richText" in v) return v.richText.map((r) => r.text).join("");
    return "";
  }
  return v;
}

function compareSortValues(a, b, dir) {
  const aEmpty = a === "" || a == null;
  const bEmpty = b === "" || b == null;
  // Empties always last regardless of direction
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  let cmp;
  if (typeof a === "number" && typeof b === "number") cmp = a - b;
  else cmp = String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
  return dir === "desc" ? -cmp : cmp;
}

function sortByColumn(colIdx, dir) {
  const sheetEl = $("sheet");
  const tbody = sheetEl.querySelector("tbody");
  if (!tbody) return;
  const ws = workbook.getWorksheet(activeSheetName);
  if (!ws) return;
  const rows = Array.from(tbody.children);
  rows.sort((a, b) => {
    const ar = parseInt(a.children[0].dataset.row, 10);
    const br = parseInt(b.children[0].dataset.row, 10);
    const av = getSortValue(ws.getRow(ar).getCell(colIdx));
    const bv = getSortValue(ws.getRow(br).getCell(colIdx));
    return compareSortValues(av, bv, dir);
  });
  rows.forEach((r) => tbody.appendChild(r));
  updateSortIndicators();
}

function handleHeaderClick(colIdx) {
  const cur = sortState[activeSheetName] || {};
  let dir;
  if (cur.col === colIdx) {
    if (cur.dir === "asc") dir = "desc";
    else if (cur.dir === "desc") { delete sortState[activeSheetName]; clearSortIndicators(); restoreOriginalOrder(); return; }
    else dir = "asc";
  } else {
    dir = "asc";
  }
  sortState[activeSheetName] = { col: colIdx, dir };
  sortByColumn(colIdx, dir);
}

function restoreOriginalOrder() {
  const tbody = $("sheet").querySelector("tbody");
  if (!tbody) return;
  const rows = Array.from(tbody.children);
  rows.sort((a, b) =>
    parseInt(a.children[0].dataset.row, 10) - parseInt(b.children[0].dataset.row, 10)
  );
  rows.forEach((r) => tbody.appendChild(r));
}

function applySort() {
  const s = sortState[activeSheetName];
  if (!s) { clearSortIndicators(); return; }
  sortByColumn(s.col, s.dir);
}

function clearSortIndicators() {
  $("sheet").querySelectorAll("thead th").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
  });
}

function updateSortIndicators() {
  clearSortIndicators();
  const s = sortState[activeSheetName];
  if (!s) return;
  const ths = $("sheet").querySelectorAll("thead th");
  ths.forEach((th) => {
    if (parseInt(th.dataset.col, 10) === s.col) {
      th.classList.add(s.dir === "asc" ? "sort-asc" : "sort-desc");
    }
  });
}

function makeColResizer(colEl, colIdx) {
  const handle = document.createElement("div");
  handle.className = "col-resize";
  const start = (e) => startDrag(e, "col", colEl, handle, colIdx);
  handle.addEventListener("mousedown", start);
  handle.addEventListener("touchstart", start, { passive: false });
  return handle;
}

function makeRowResizer(trEl, rowIdx) {
  const handle = document.createElement("div");
  handle.className = "row-resize";
  const start = (e) => startDrag(e, "row", trEl, handle, rowIdx);
  handle.addEventListener("mousedown", start);
  handle.addEventListener("touchstart", start, { passive: false });
  return handle;
}

function startDrag(e, kind, target, handle, idx) {
  e.preventDefault();
  e.stopPropagation();
  handle.classList.add("dragging");
  const startPos = e.touches ? (kind === "col" ? e.touches[0].clientX : e.touches[0].clientY) : (kind === "col" ? e.clientX : e.clientY);
  const startSize = kind === "col"
    ? parseInt(target.style.width || "140", 10)
    : target.getBoundingClientRect().height;

  let lastSize = startSize;
  const onMove = (ev) => {
    const pos = ev.touches ? (kind === "col" ? ev.touches[0].clientX : ev.touches[0].clientY) : (kind === "col" ? ev.clientX : ev.clientY);
    const delta = pos - startPos;
    lastSize = Math.max(40, startSize + delta);
    if (kind === "col") target.style.width = `${lastSize}px`;
    else target.style.height = `${lastSize}px`;
  };
  const onUp = () => {
    handle.classList.remove("dragging");
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onUp);

    if (lastSize !== startSize) persistResize(kind, idx, lastSize);
  };
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
  document.addEventListener("touchmove", onMove, { passive: false });
  document.addEventListener("touchend", onUp);
}

function persistResize(kind, idx, pixels) {
  const ws = workbook.getWorksheet(activeSheetName);
  if (!ws) return;
  if (kind === "col") {
    // Excel column width is in character units (~7px per unit)
    ws.getColumn(idx).width = pixels / 7;
    dirtyCells.add(`${activeSheetName}!col-width-${idx}`);
  } else {
    // Excel row height is in points (~0.75 of a px at 96dpi)
    ws.getRow(idx).height = pixels * 0.75;
    dirtyCells.add(`${activeSheetName}!row-height-${idx}`);
  }
  setStatus(`${dirtyCells.size} unsaved change(s)`);
}

function lastNonEmptyRow(ws, maxCol) {
  for (let r = ws.rowCount; r >= 1; r--) {
    for (let c = 1; c <= maxCol; c++) {
      const v = ws.getRow(r).getCell(c).value;
      if (v !== null && v !== undefined && v !== "") return r;
    }
  }
  return 0;
}

function isFormulaCell(cell) {
  return cell.value && typeof cell.value === "object" && "formula" in cell.value;
}

function getCellValidation(ws, row, col) {
  const dvs = ws.dataValidations;
  if (!dvs) return null;
  const model = dvs.model || dvs;
  for (const sqref of Object.keys(model)) {
    if (cellInRanges(sqref, row, col)) return model[sqref];
  }
  return null;
}

function cellInRanges(sqref, row, col) {
  for (const part of sqref.split(/\s+/)) {
    const m = part.match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/i);
    if (!m) continue;
    const startCol = colLetterToNum(m[1]);
    const startRow = Number(m[2]);
    const endCol = m[3] ? colLetterToNum(m[3]) : startCol;
    const endRow = m[4] ? Number(m[4]) : startRow;
    if (row >= startRow && row <= endRow && col >= startCol && col <= endCol) return true;
  }
  return false;
}

function colLetterToNum(letters) {
  let n = 0;
  for (let i = 0; i < letters.length; i++) n = n * 26 + (letters.toUpperCase().charCodeAt(i) - 64);
  return n;
}

function parseListOptions(formulae) {
  if (!formulae || !formulae[0]) return [];
  let f = formulae[0];
  if (f.startsWith("=")) f = f.slice(1);
  if (f.startsWith('"') && f.endsWith('"')) f = f.slice(1, -1);
  return f.split(",").map((s) => s.trim()).filter(Boolean);
}

// [bg, text] color map per known option value
const DROPDOWN_COLORS = {
  // Jobs Decision
  "1. Apply":        ["#c6efce", "#006100"],
  "2. Easy Apply":   ["#80cbc4", "#004d40"],
  "3. Recommended":  ["#ffe082", "#7f5d00"],
  "4. Saved":        ["#cce5ff", "#1f4e78"],
  "5. Pending":      ["#eeeeee", "#555555"],
  "6. Skip":         ["#ffc7ce", "#9c0006"],
  // Fit Score 1-5
  "1": ["#ffc7ce", "#9c0006"],
  "2": ["#ffe0b2", "#b45309"],
  "3": ["#ffeb9c", "#7f6000"],
  "4": ["#d9ead3", "#38761d"],
  "5": ["#c6efce", "#006100"],
  // Video status
  "Not required": ["#eeeeee", "#555555"],
  "Not recorded": ["#ffc7ce", "#9c0006"],
  "Recording":    ["#ffeb9c", "#7f6000"],
  "Recorded":     ["#cce5ff", "#1f4e78"],
  "Submitted":    ["#c6efce", "#006100"],
  // Submission status
  "Not submitted": ["#ffc7ce", "#9c0006"],
  // Applications Status
  "Evaluated":  ["#cce5ff", "#1f4e78"],
  "Applied":    ["#c6efce", "#006100"],
  "Responded":  ["#b7e1cd", "#1f4e78"],
  "Interview":  ["#fff2cc", "#7f6000"],
  "Offer":      ["#ffd966", "#7f6000"],
  "Rejected":   ["#ffc7ce", "#9c0006"],
  "Discarded":  ["#eeeeee", "#555555"],
};

function applyDropdownStyle(select) {
  const colors = DROPDOWN_COLORS[select.value];
  if (colors) {
    select.style.backgroundColor = colors[0];
    select.style.color = colors[1];
    select.style.fontWeight = "600";
  } else {
    select.style.backgroundColor = "";
    select.style.color = "";
    select.style.fontWeight = "";
  }
}

function makeDropdown(validation, currentValue, r, c) {
  const select = document.createElement("select");
  select.className = "cell-dropdown";
  const options = parseListOptions(validation.formulae);
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "—";
  select.appendChild(blank);
  for (const opt of options) {
    const o = document.createElement("option");
    o.value = opt;
    o.textContent = opt;
    const colors = DROPDOWN_COLORS[opt];
    if (colors) {
      o.style.backgroundColor = colors[0];
      o.style.color = colors[1];
    }
    select.appendChild(o);
  }
  const initial = options.includes(currentValue) ? currentValue : "";
  select.value = initial;
  select.dataset.row = r;
  select.dataset.col = c;
  applyDropdownStyle(select);
  select.addEventListener("change", onDropdownChange);
  return select;
}

function onDropdownChange(e) {
  const sel = e.target;
  const r = parseInt(sel.dataset.row, 10);
  const c = parseInt(sel.dataset.col, 10);
  const ws = workbook.getWorksheet(activeSheetName);
  const cell = ws.getRow(r).getCell(c);
  cell.value = sel.value || null;
  applyDropdownStyle(sel);
  sel.parentElement.classList.add("dirty");
  dirtyCells.add(`${activeSheetName}!${r},${c}`);
  setStatus(`${dirtyCells.size} unsaved change(s)`);

  // Auto-promote / un-promote when Preparations Submission status changes
  if (activeSheetName === "Preparations" && c === SCHEMA.Preparations.submissionStatus) {
    if (sel.value === "Submitted") {
      if (!confirm("Promote this to Applications with Status = Applied?\n\nA new row will be added to the Applications tab.\n\n(Cancel = leave Submission status alone.)")) {
        // Revert the dropdown
        sel.value = "Not submitted";
        cell.value = "Not submitted";
        applyDropdownStyle(sel);
        return;
      }
      promoteToApplications(r);
    } else {
      // Submitted -> something else; offer to remove the promoted Applications row
      unpromoteFromApplications(r);
    }
  }
}

function unpromoteFromApplications(prepRow) {
  const apps = workbook.getWorksheet("Applications");
  const prep = workbook.getWorksheet("Preparations");
  if (!apps || !prep) return;

  const company = (prep.getRow(prepRow).getCell(SCHEMA.Preparations.company).value || "").toString().trim();
  const role = (prep.getRow(prepRow).getCell(SCHEMA.Preparations.role).value || "").toString().trim();
  if (!company || !role) return;

  let match = null;
  for (let r = 2; r <= apps.rowCount; r++) {
    const aco = (apps.getRow(r).getCell(SCHEMA.Applications.company).value || "").toString().trim();
    const arole = (apps.getRow(r).getCell(SCHEMA.Applications.role).value || "").toString().trim();
    if (aco === company && arole === role) { match = r; break; }
  }
  if (!match) return;

  if (!confirm(`Found a matching row in Applications (row ${match}: ${company} — ${role}).\n\nClear that row too?\n\n(OK = clear it. Cancel = leave it alone.)`)) return;

  // Clear all data fields on the matched Applications row (preserve the =ROW()-1 formula in col 1)
  const row = apps.getRow(match);
  for (let c = 2; c <= apps.columnCount; c++) {
    row.getCell(c).value = null;
  }
  row.commit();
  dirtyCells.add(`Applications!${match},unpromote`);
  setStatus(`Cleared Applications row ${match}. Save to commit.`);
  if (activeSheetName === "Applications") renderSheet();
}

function promoteToApplications(prepRow) {
  const prep = workbook.getWorksheet("Preparations");
  const apps = workbook.getWorksheet("Applications");
  if (!prep || !apps) return;

  const get = (col) => {
    const v = prep.getRow(prepRow).getCell(col).value;
    if (v === null || v === undefined) return "";
    if (typeof v === "object") {
      if (v.text) return v.text;
      if (v.richText) return v.richText.map((p) => p.text).join("");
      if (v.result !== undefined) return String(v.result);
      if (v.formula) return "";
      return "";
    }
    return String(v);
  };
  const SP = SCHEMA.Preparations;
  const SA = SCHEMA.Applications;
  const company = get(SP.company).trim();
  const role = get(SP.role).trim();
  const url = get(SP.jobUrl).trim();
  const cvPath = get(SP.cvPath).trim();
  const today = new Date().toISOString().slice(0, 10);
  const meta = getJobsMeta(company, role);

  // Look for an existing Applications row with the same Company+Role
  let existingRow = null;
  const lastRow = apps.rowCount;
  for (let r = 2; r <= lastRow; r++) {
    const aco = (apps.getRow(r).getCell(SA.company).value || "").toString().trim();
    const arole = (apps.getRow(r).getCell(SA.role).value || "").toString().trim();
    if (aco === company && arole === role) { existingRow = r; break; }
  }

  if (existingRow) {
    setStatus(`Already in Applications row ${existingRow}; not duplicated.`);
    return;
  }

  // Find first empty data row
  let target = 2;
  while (target <= 1001) {
    const row = apps.getRow(target);
    const empty = !row.getCell(SA.dateApplied).value && !row.getCell(SA.company).value && !row.getCell(SA.role).value;
    if (empty) break;
    target++;
  }

  const row = apps.getRow(target);
  setRowIndexFormula(apps, target);
  row.getCell(SA.dateApplied).value  = today;
  row.getCell(SA.company).value      = company;
  row.getCell(SA.role).value         = role;
  row.getCell(SA.location).value     = meta.elig || "";
  row.getCell(SA.source).value       = meta.source || "";
  row.getCell(SA.jobUrl).value       = url;
  row.getCell(SA.status).value       = "Applied";
  row.getCell(SA.lastUpdate).value   = today;
  row.getCell(SA.cvUsed).value       = cvPath;
  row.getCell(SA.nextAction).value   = "Wait for recruiter response";
  row.getCell(SA.followUpDate).value = isoDaysFromNow(14);
  const aiDisclaimer = get(SP.aiDisclaimer).trim();
  const noteParts = [`Promoted from Preparations row ${prepRow}`];
  if (aiDisclaimer && aiDisclaimer.toUpperCase().startsWith("YES")) noteParts.push("AI disclaimer: rewrite in own voice");
  if (meta.notes) noteParts.push(meta.notes);
  if (meta.why)   noteParts.push(meta.why);
  row.getCell(SA.notes).value = noteParts.join(" | ");
  row.commit();

  dirtyCells.add(`Applications!${target},promote`);
  setStatus(`Promoted to Applications row ${target} (Status=Applied). Save to commit.`);

  // If the Applications tab is visible, re-render so the new row is shown
  if (activeSheetName === "Applications") renderSheet();
}

function renderCell(cell, rowNum) {
  const v = cell.value;
  if (v === null || v === undefined) return "";
  if (typeof v !== "object") return String(v);

  if (v.richText) return v.richText.map((p) => p.text).join("");
  if (v.text) return v.text;
  if (v instanceof Date) return v.toISOString().slice(0, 10);

  // Formula cell — try to resolve
  if ("formula" in v) {
    if (v.result !== undefined && v.result !== null) {
      if (typeof v.result === "object" && v.result.error) return `#${v.result.error}`;
      return String(v.result);
    }
    // Best-effort evaluation of the simple formulas this tracker uses
    const computed = tryEvalFormula(v.formula, rowNum);
    if (computed !== null) return String(computed);
    return `=${v.formula}`;
  }

  return JSON.stringify(v);
}

function tryEvalFormula(formula, rowNum) {
  if (!formula) return null;
  const f = formula.replace(/\s+/g, "");
  const upper = f.toUpperCase();

  if (upper === "ROW()") return rowNum;
  const rowMatch = upper.match(/^ROW\(\)([+-])(\d+)$/);
  if (rowMatch) return rowMatch[1] === "+" ? rowNum + Number(rowMatch[2]) : rowNum - Number(rowMatch[2]);

  // COUNTIF(range, "criterion")
  const countIfMatch = f.match(/^COUNTIF\((?:'([^']+)'|([A-Za-z_][A-Za-z0-9_ ]*))?!?([A-Z]+(?:\d+)?):([A-Z]+(?:\d+)?),"([^"]*)"\)$/i);
  if (countIfMatch) {
    const sheetName = countIfMatch[1] || countIfMatch[2] || activeSheetName;
    const values = collectRangeValues(sheetName, countIfMatch[3], countIfMatch[4]);
    if (values === null) return null;
    const target = countIfMatch[5];
    return values.filter((v) => stringifyValue(v) === target).length;
  }

  // Aggregations over a range, optionally on another sheet:
  //   FUNC(SheetName!A1:A1000) | FUNC('Sheet Name'!A1:A1000) | FUNC(A1:A10) | FUNC(H:H)
  const aggMatch = f.match(/^(COUNTA|COUNT|SUM|MAX|MIN|AVERAGE)\((?:'([^']+)'|([A-Za-z_][A-Za-z0-9_ ]*))?!?([A-Z]+(?:\d+)?):([A-Z]+(?:\d+)?)\)$/i);
  if (aggMatch) {
    const fn = aggMatch[1].toUpperCase();
    const sheetName = aggMatch[2] || aggMatch[3] || activeSheetName;
    const values = collectRangeValues(sheetName, aggMatch[4], aggMatch[5]);
    if (values === null) return null;
    return aggregate(fn, values);
  }
  return null;
}

function stringifyValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    if (v.richText) return v.richText.map((p) => p.text).join("");
    if (v.text) return v.text;
    if (v.result !== undefined) return String(v.result);
    return "";
  }
  return String(v);
}

function collectRangeValues(sheetName, startRef, endRef) {
  const ws = workbook.getWorksheet(sheetName);
  if (!ws) return null;
  const start = parseRef(startRef);
  const end = parseRef(endRef);
  if (!start || !end) return null;
  const sheetLastRow = lastNonEmptyRow(ws, ws.columnCount) || 0;
  const startRow = start.row || 1;
  const endRow = end.row || sheetLastRow;
  const lastRow = Math.min(endRow, sheetLastRow || endRow);
  const out = [];
  for (let r = startRow; r <= lastRow; r++) {
    for (let c = start.col; c <= end.col; c++) {
      const v = ws.getRow(r).getCell(c).value;
      if (v !== null && v !== undefined && v !== "") out.push(v);
    }
  }
  return out;
}

function parseRef(ref) {
  // Match either "A1" (with row) or "A" (column-only, for H:H ranges)
  const m = ref.match(/^([A-Z]+)(\d*)$/i);
  if (!m) return null;
  let col = 0;
  const letters = m[1].toUpperCase();
  for (let i = 0; i < letters.length; i++) col = col * 26 + (letters.charCodeAt(i) - 64);
  return { col, row: m[2] ? Number(m[2]) : 0 };
}

function aggregate(fn, values) {
  if (fn === "COUNTA") return values.length;
  const nums = values.map((v) => (typeof v === "object" && v && "result" in v ? v.result : v))
    .map(Number).filter((n) => !isNaN(n));
  if (fn === "COUNT") return nums.length;
  if (fn === "SUM") return nums.reduce((a, b) => a + b, 0);
  if (fn === "MAX") return nums.length ? Math.max(...nums) : 0;
  if (fn === "MIN") return nums.length ? Math.min(...nums) : 0;
  if (fn === "AVERAGE") return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  return null;
}

// ---------- Editing ----------
// ---------- Repo-relative path cells: render with a "↗" GitHub link ----------
// Matches relative paths like "prep/foo.md", "output/cv-bar.pdf", "cv-default.pdf"
// at the repo root. Excludes anything containing :// (URLs) or whitespace.
const REPO_PATH_RE = /^[\w./-]+\.(md|pdf|html|tex|txt)$/i;

function blobUrl(path) {
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/${encodeURI(path)}`;
}

function makePathCell(td, text, r, c) {
  td.classList.add("path-cell");

  const span = document.createElement("span");
  span.className = "cell-text";
  span.textContent = text;
  span.contentEditable = "true";
  span.dataset.row = r;
  span.dataset.col = c;
  span.addEventListener("blur", onPathCellEdit);
  td.appendChild(span);

  const link = document.createElement("a");
  link.className = "cell-link";
  link.href = blobUrl(text);
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "↗";
  link.contentEditable = "false";
  link.title = `Open ${text} on GitHub`;
  // Don't bubble click into the span (avoids spurious focus)
  link.addEventListener("mousedown", (e) => e.stopPropagation());
  td.appendChild(link);
}

function onPathCellEdit(e) {
  const span = e.target;
  const td = span.parentElement;
  const r = parseInt(span.dataset.row, 10);
  const c = parseInt(span.dataset.col, 10);
  const newText = span.textContent;
  const ws = workbook.getWorksheet(activeSheetName);
  const cell = ws.getRow(r).getCell(c);
  const oldText = renderCell(cell, r);
  if (newText !== oldText) {
    cell.value = newText;
    td.classList.add("dirty");
    dirtyCells.add(`${activeSheetName}!${r},${c}`);
    setStatus(`${dirtyCells.size} unsaved change(s)`);
  }
  // Refresh the link href if the value changed (or hide if no longer a path)
  const link = td.querySelector("a.cell-link");
  if (link) {
    if (REPO_PATH_RE.test(newText)) {
      link.href = blobUrl(newText);
      link.style.display = "";
      link.title = `Open ${newText} on GitHub`;
    } else {
      link.style.display = "none";
    }
  }
}

function onCellEdit(e) {
  const td = e.target;
  const r = parseInt(td.dataset.row, 10);
  const c = parseInt(td.dataset.col, 10);
  const newText = td.textContent;
  const ws = workbook.getWorksheet(activeSheetName);
  const cell = ws.getRow(r).getCell(c);
  const oldText = renderCell(cell, r);
  if (newText !== oldText) {
    // Preserve numbers if it parses cleanly
    const asNum = Number(newText);
    cell.value = newText !== "" && !isNaN(asNum) && newText.trim() === String(asNum) ? asNum : newText;
    td.classList.add("dirty");
    dirtyCells.add(`${activeSheetName}!${r},${c}`);
    setStatus(`${dirtyCells.size} unsaved change(s)`);
  }
}

function addRow() {
  const ws = workbook.getWorksheet(activeSheetName);
  const newRowNum = ws.rowCount + 1;
  // Mirror header styling for Prep sheet body cells
  const newRow = ws.getRow(newRowNum);
  for (let c = 1; c <= ws.columnCount; c++) {
    newRow.getCell(c).value = "";
    newRow.getCell(c).alignment = { vertical: "top", wrapText: true };
  }
  newRow.commit();
  renderSheet();
  setStatus(`Added row ${newRowNum}. Don't forget to save.`);
}

// ---------- Save back to GitHub ----------
// Jobs (formerly Wishlist) Decision col index (1-based): # | Date | Company | Role | URL | Source | WorkElig | Why | Fit | Deadline | Decision | Notes
const JOBS_DECISION_COL = SCHEMA.Jobs.decision;
const JOBS_DELETE_ON_SAVE = new Set(["6. Skip"]);

// Jobs Decision values that propagate to other sheets on save (dirty cells only).
const JOBS_PROMOTIONS = {
  "1. Apply":      { sheet: "Preparations", desc: "Preparations row (full prep flow)" },
  "2. Easy Apply": { sheet: "Applications", desc: "Applications row (Status=Applied)" },
};

function findJobsPromotions() {
  const ws = workbook.getWorksheet("Jobs");
  if (!ws) return [];
  const out = [];
  for (const key of dirtyCells) {
    const m = key.match(/^Jobs!(\d+),(\d+)$/);
    if (!m) continue;
    const c = parseInt(m[2], 10);
    if (c !== JOBS_DECISION_COL) continue;
    const r = parseInt(m[1], 10);
    const dec = readCellAsString(ws.getRow(r).getCell(c)).trim();
    const cfg = JOBS_PROMOTIONS[dec];
    if (!cfg) continue;
    const co = readCellAsString(ws.getRow(r).getCell(SCHEMA.Jobs.company)).trim();
    const role = readCellAsString(ws.getRow(r).getCell(SCHEMA.Jobs.role)).trim();
    if (!co || !role) continue;
    if (rowExistsInSheet(cfg.sheet, co, role)) continue;
    out.push({ row: r, decision: dec, sheet: cfg.sheet, desc: cfg.desc, company: co, role });
  }
  return out;
}

function rowExistsInSheet(sheetName, company, role) {
  const ws = workbook.getWorksheet(sheetName);
  if (!ws) return false;
  const S = SCHEMA[sheetName] || {};
  const companyCol = S.company || 3;
  const roleCol    = S.role    || 4;
  for (let r = 2; r <= ws.rowCount; r++) {
    const co = readCellAsString(ws.getRow(r).getCell(companyCol)).trim();
    const rl = readCellAsString(ws.getRow(r).getCell(roleCol)).trim();
    if (co === company && rl === role) return true;
  }
  return false;
}

function findFirstEmptyDataRow(ws, dataCol) {
  for (let r = 2; r <= ws.rowCount; r++) {
    if (!ws.getRow(r).getCell(dataCol).value) return r;
  }
  return ws.rowCount + 1;
}

// Robust extractors — cell.value can be string, number, Date, hyperlink object,
// rich-text object, or formula object depending on how Excel stored it.
function readCellAsString(cell) {
  const v = cell?.value;
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "object") {
    if (Array.isArray(v.richText)) return v.richText.map((p) => p.text || "").join("");
    if (typeof v.text === "string") return v.text;
    if (typeof v.hyperlink === "string") return v.hyperlink;
    if (typeof v.result === "string" || typeof v.result === "number") return String(v.result);
  }
  return String(v);
}

function readCellAsUrl(cell) {
  const v = cell?.value;
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if (typeof v.hyperlink === "string") return v.hyperlink;
    if (typeof v.text === "string") return v.text;
  }
  return readCellAsString(cell);
}

function getJobsMeta(company, role) {
  const ws = workbook.getWorksheet("Jobs");
  const S = SCHEMA.Jobs;
  for (let r = 2; r <= ws.rowCount; r++) {
    const co = readCellAsString(ws.getRow(r).getCell(S.company)).trim();
    const rl = readCellAsString(ws.getRow(r).getCell(S.role)).trim();
    if (co === company && rl === role) {
      return {
        url:    readCellAsUrl(ws.getRow(r).getCell(S.url)),
        source: readCellAsString(ws.getRow(r).getCell(S.source)),
        elig:   readCellAsString(ws.getRow(r).getCell(S.elig)),
        why:    readCellAsString(ws.getRow(r).getCell(S.why)),
        notes:  readCellAsString(ws.getRow(r).getCell(S.notes)),
      };
    }
  }
  return { url: "", source: "", elig: "", why: "", notes: "" };
}

function setCellDirty(ws, r, c, value) {
  ws.getRow(r).getCell(c).value = value;
  dirtyCells.add(`${ws.name}!${r},${c}`);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isoDaysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function setRowIndexFormula(target, r) {
  // Match existing rows that use =ROW()-1 in col 1
  target.getRow(r).getCell(1).value = { formula: "ROW()-1" };
  dirtyCells.add(`${target.name}!${r},1`);
}

function slugifyForPath(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function createPreparationsRow(company, role) {
  const target = workbook.getWorksheet("Preparations");
  if (!target) return null;
  const S = SCHEMA.Preparations;
  const r = findFirstEmptyDataRow(target, S.date);
  const meta = getJobsMeta(company, role);
  const date = todayISO();
  const qaPath = `prep/${slugifyForPath(company)}-${slugifyForPath(role)}-${date}.md`;
  setRowIndexFormula(target, r);
  setCellDirty(target, r, S.date,             date);
  setCellDirty(target, r, S.company,          company);
  setCellDirty(target, r, S.role,             role);
  setCellDirty(target, r, S.jobUrl,           meta.url);
  setCellDirty(target, r, S.cvPath,           "cv-default.pdf");
  setCellDirty(target, r, S.cvStatus,         "Default CV (replace if tailoring)");
  setCellDirty(target, r, S.qa,               qaPath);
  setCellDirty(target, r, S.submissionStatus, "Not submitted");
  const noteParts = [];
  if (meta.elig)   noteParts.push(`Location: ${meta.elig}`);
  if (meta.source) noteParts.push(`Source: ${meta.source}`);
  if (meta.notes)  noteParts.push(meta.notes);
  if (noteParts.length) setCellDirty(target, r, S.notes, noteParts.join(" | "));
  return r;
}

function createApplicationsRow(company, role) {
  const target = workbook.getWorksheet("Applications");
  if (!target) return null;
  const S = SCHEMA.Applications;
  const r = findFirstEmptyDataRow(target, S.dateApplied);
  const meta = getJobsMeta(company, role);
  setRowIndexFormula(target, r);
  setCellDirty(target, r, S.dateApplied,  todayISO());
  setCellDirty(target, r, S.company,      company);
  setCellDirty(target, r, S.role,         role);
  setCellDirty(target, r, S.location,     meta.elig);
  setCellDirty(target, r, S.source,       meta.source);
  setCellDirty(target, r, S.jobUrl,       meta.url);
  setCellDirty(target, r, S.status,       "Applied");
  setCellDirty(target, r, S.lastUpdate,   todayISO());
  setCellDirty(target, r, S.cvUsed,       "cv-default.pdf");
  setCellDirty(target, r, S.nextAction,   "Wait for recruiter response");
  setCellDirty(target, r, S.followUpDate, isoDaysFromNow(14));
  if (meta.notes) setCellDirty(target, r, S.notes, meta.notes);
  return r;
}

function findJobsRowsToDelete() {
  const ws = workbook.getWorksheet("Jobs");
  if (!ws) return [];
  const hits = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const dec = (row.getCell(JOBS_DECISION_COL).value || "").toString().trim();
    if (!JOBS_DELETE_ON_SAVE.has(dec)) continue;
    const co = (row.getCell(SCHEMA.Jobs.company).value || "").toString().trim();
    const role = (row.getCell(SCHEMA.Jobs.role).value || "").toString().trim();
    if (!co && !role) continue; // skip empty
    hits.push({ row: r, decision: dec, company: co, role });
  }
  return hits;
}

async function save() {
  if (!workbook) return;

  // Pre-save: prompt to permanently delete Skip-marked Jobs rows
  const toDelete = findJobsRowsToDelete();

  if (dirtyCells.size === 0 && toDelete.length === 0 && !confirm("No edits detected. Save anyway?")) return;

  if (toDelete.length > 0) {
    const preview = toDelete
      .slice(0, 15)
      .map((h) => `  • [${h.decision}] ${h.company} — ${h.role}`)
      .join("\n");
    const more = toDelete.length > 15 ? `\n  …and ${toDelete.length - 15} more` : "";
    const ok = confirm(
      `${toDelete.length} Jobs row(s) marked Skip will be PERMANENTLY DELETED on save:\n\n${preview}${more}\n\nProceed?`
    );
    if (!ok) {
      setStatus("Save cancelled.");
      return;
    }
    const ws = workbook.getWorksheet("Jobs");
    // Delete bottom-up to keep row indices stable
    for (const hit of toDelete.sort((a, b) => b.row - a.row)) {
      ws.spliceRows(hit.row, 1);
    }
  }

  // Pre-save: propagate Decision = Apply / Easy Apply to Preparations / Applications
  const promotions = findJobsPromotions();
  let promoted = 0;
  if (promotions.length > 0) {
    const byTarget = promotions.reduce((acc, p) => {
      (acc[p.sheet] = acc[p.sheet] || []).push(p);
      return acc;
    }, {});
    for (const [sheet, list] of Object.entries(byTarget)) {
      const verb = list[0].desc;
      const preview = list.slice(0, 10).map((h) => `  • [${h.decision}] ${h.company} — ${h.role}`).join("\n");
      const more = list.length > 10 ? `\n  …and ${list.length - 10} more` : "";
      const ok = confirm(
        `${list.length} Jobs row(s) marked "${list[0].decision}" — create matching ${verb}?\n\n${preview}${more}\n\n` +
        `OK = create now. Cancel = skip and save without propagating.`
      );
      if (!ok) continue;
      for (const h of list) {
        if (sheet === "Preparations") createPreparationsRow(h.company, h.role);
        else if (sheet === "Applications") createApplicationsRow(h.company, h.role);
        promoted++;
      }

      // Offer to also hide the source Jobs rows
      const hideOk = confirm(
        `Propagated ${list.length} row(s) to ${sheet}. Also mark them Hidden in Jobs?\n\n` +
        `Hidden rows are removed from the default Jobs view but preserved in the file. ` +
        `Toggle "Show hidden" to bring them back.\n\n` +
        `OK = hide. Cancel = leave visible.`
      );
      if (hideOk) {
        const jobsWs = workbook.getWorksheet("Jobs");
        for (const h of list) {
          jobsWs.getRow(h.row).getCell(JOBS_HIDE_COL).value = "Hidden";
          dirtyCells.add(`Jobs!${h.row},${JOBS_HIDE_COL}`);
        }
      }
    }
    if (promoted > 0) {
      renderTabs();
      renderSheet();
    }
  }

  const pat = getPat();
  if (!pat) return;
  setStatus("Saving…");
  $("save-btn").disabled = true;

  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = bufferToBase64(buffer);

    const res = await fetch(API_BASE, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: (() => {
          const parts = [`${dirtyCells.size} edits`];
          if (toDelete.length > 0) parts.push(`${toDelete.length} Skip rows deleted`);
          if (promoted > 0) parts.push(`${promoted} Apply/Easy-Apply propagated`);
          return `Update tracker via web editor (${parts.join(", ")})`;
        })(),
        content: base64,
        sha: currentSha,
        branch: BRANCH,
      }),
    });

    if (res.status === 409) {
      $("save-btn").disabled = false;
      const rebased = await rebaseAndRetrySave();
      if (rebased) return save();
      return;
    }

    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const result = await res.json();
    currentSha = result.content.sha;
    dirtyCells.clear();
    document.querySelectorAll("td.dirty").forEach((td) => td.classList.remove("dirty"));
    setStatus(`Saved at ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    console.error(err);
    setStatus(`Save failed: ${err.message}`);
    alert(`Save failed:\n${err.message}\n\nClick ↻ to reload (will lose unsaved edits).`);
  } finally {
    $("save-btn").disabled = false;
  }
}

// ---------- 409 conflict: rebase pending edits onto fresh remote ----------
const ANCHORED_SHEETS = new Set(["Jobs", "Applications", "Preparations"]);

function snapshotDirtyEdits() {
  const edits = [];
  for (const key of dirtyCells) {
    const m = key.match(/^([^!]+)!(\d+),(\d+)$/);
    if (!m) continue; // skip non-cell keys (col-width, row-height)
    const sheet = m[1];
    const r = parseInt(m[2], 10);
    const c = parseInt(m[3], 10);
    const ws = workbook.getWorksheet(sheet);
    if (!ws) continue;
    const value = ws.getRow(r).getCell(c).value;
    let anchor = null;
    if (ANCHORED_SHEETS.has(sheet)) {
      const S = SCHEMA[sheet] || {};
      anchor = {
        company: (ws.getRow(r).getCell(S.company || 3).value || "").toString().trim(),
        role:    (ws.getRow(r).getCell(S.role    || 4).value || "").toString().trim(),
      };
      if (!anchor.company && !anchor.role) anchor = null;
    }
    edits.push({ sheet, row: r, col: c, value, anchor });
  }
  return edits;
}

async function rebaseAndRetrySave() {
  const edits = snapshotDirtyEdits();
  if (edits.length === 0) {
    alert("Save conflicted (409) but no cell edits to rebase. Reloading.");
    await loadWorkbook();
    return false;
  }

  const ok = confirm(
    `Save conflicted (409) — the file changed on GitHub since you opened it.\n\n` +
    `Auto-rebase ${edits.length} pending edit(s)?\n` +
    `Reload latest, re-anchor edits by Company+Role, retry save.\n\n` +
    `Cancel = leave editor as-is so you can copy your edits manually.`
  );
  if (!ok) return false;

  setStatus("Rebasing…");
  await loadWorkbook();

  let applied = 0;
  const failed = [];
  for (const e of edits) {
    const ws = workbook.getWorksheet(e.sheet);
    if (!ws) { failed.push(e); continue; }
    let targetRow = e.row;
    if (e.anchor) {
      let found = 0;
      for (let r = 2; r <= ws.rowCount; r++) {
        const co = (ws.getRow(r).getCell(3).value || "").toString().trim();
        const rl = (ws.getRow(r).getCell(4).value || "").toString().trim();
        if (co === e.anchor.company && rl === e.anchor.role) { found = r; break; }
      }
      if (!found) { failed.push(e); continue; }
      targetRow = found;
    }
    ws.getRow(targetRow).getCell(e.col).value = e.value;
    dirtyCells.add(`${e.sheet}!${targetRow},${e.col}`);
    applied++;
  }

  renderSheet();
  setStatus(`Rebased ${applied} edit(s)${failed.length ? `, ${failed.length} unanchored` : ""}`);

  if (failed.length > 0) {
    const detail = failed.slice(0, 5).map((e) =>
      `  • ${e.sheet} r${e.row}c${e.col}: ${e.anchor?.company || "?"} | ${e.anchor?.role || "?"} → ${e.value}`
    ).join("\n");
    const more = failed.length > 5 ? `\n  …and ${failed.length - 5} more` : "";
    alert(
      `Could not re-anchor ${failed.length} edit(s) — the underlying row was likely deleted upstream:\n\n${detail}${more}\n\n` +
      `Review and re-apply manually if needed. The other ${applied} edit(s) are queued; click Save to push.`
    );
    return false;
  }
  return true;
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// ---------- Wire up ----------
$("save-btn").onclick = save;
$("reload-btn").onclick = () => {
  if (dirtyCells.size > 0 && !confirm(`Discard ${dirtyCells.size} unsaved edits?`)) return;
  loadWorkbook();
};
$("logout-btn").onclick = logout;
$("add-row-btn").onclick = addRow;

window.addEventListener("beforeunload", (e) => {
  if (dirtyCells.size > 0) {
    e.preventDefault();
    e.returnValue = "";
  }
});

loadWorkbook();
