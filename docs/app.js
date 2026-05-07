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

    activeSheetName = workbook.worksheets[0].name;
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

// ---------- Rendering ----------
function renderTabs() {
  const tabs = $("tabs");
  tabs.innerHTML = "";
  workbook.worksheets.forEach((ws) => {
    const btn = document.createElement("button");
    btn.textContent = ws.name;
    if (ws.name === activeSheetName) btn.classList.add("active");
    btn.onclick = () => {
      activeSheetName = ws.name;
      renderTabs();
      renderSheet();
    };
    tabs.appendChild(btn);
  });
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
    th.textContent = renderCell(ws.getRow(1).getCell(c), 1);
    th.appendChild(makeColResizer(colgroup.children[c - 1], c));
    headerTr.appendChild(th);
  }
  thead.appendChild(headerTr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (let r = 2; r <= lastRow; r++) {
    const tr = document.createElement("tr");
    const xlsxRow = ws.getRow(r);
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
          td.textContent = renderCell(cell, r);
          td.contentEditable = "true";
          td.addEventListener("blur", onCellEdit);
        }
      }
      if (c === 1) td.appendChild(makeRowResizer(tr, r));
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);
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
  // Wishlist Decision
  "Pending":      ["#eeeeee", "#555555"],
  "Apply":        ["#c6efce", "#006100"],
  "Skip":         ["#ffc7ce", "#9c0006"],
  "Saved":        ["#cce5ff", "#1f4e78"],
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
  // Submission status (most overlap with above; explicit listing keeps it self-documenting)
  "Not submitted": ["#ffc7ce", "#9c0006"],
  "Acknowledged":  ["#cce5ff", "#1f4e78"],
  "Interview":     ["#b7e1cd", "#1f4e78"],
  "Rejected":      ["#eeeeee", "#555555"],
  "Withdrawn":     ["#eeeeee", "#555555"],
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
function onCellEdit(e) {
  const td = e.target;
  const r = parseInt(td.dataset.row, 10);
  const c = parseInt(td.dataset.col, 10);
  const newText = td.textContent;
  const ws = workbook.getWorksheet(activeSheetName);
  const cell = ws.getRow(r).getCell(c);
  const oldText = cellToString(cell.value);
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
async function save() {
  if (!workbook) return;
  if (dirtyCells.size === 0 && !confirm("No edits detected. Save anyway?")) return;
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
        message: `Update tracker via web editor (${dirtyCells.size} edits)`,
        content: base64,
        sha: currentSha,
        branch: BRANCH,
      }),
    });

    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const result = await res.json();
    currentSha = result.content.sha;
    dirtyCells.clear();
    document.querySelectorAll("td.dirty").forEach((td) => td.classList.remove("dirty"));
    setStatus(`Saved at ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    console.error(err);
    setStatus(`Save failed: ${err.message}`);
    alert(`Save failed:\n${err.message}\n\nIf this says 409, someone else (or the auto-pipeline) edited the file. Click ↻ to reload.`);
  } finally {
    $("save-btn").disabled = false;
  }
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
