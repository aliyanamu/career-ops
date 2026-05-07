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

  const table = document.createElement("table");
  const maxCol = ws.columnCount;

  // Header row (row 1)
  const thead = document.createElement("thead");
  const headerTr = document.createElement("tr");
  for (let c = 1; c <= maxCol; c++) {
    const th = document.createElement("th");
    const cell = ws.getRow(1).getCell(c);
    th.textContent = cellToString(cell.value);
    headerTr.appendChild(th);
  }
  thead.appendChild(headerTr);
  table.appendChild(thead);

  // Body rows (row 2+)
  const tbody = document.createElement("tbody");
  for (let r = 2; r <= ws.rowCount; r++) {
    const tr = document.createElement("tr");
    for (let c = 1; c <= maxCol; c++) {
      const td = document.createElement("td");
      const cell = ws.getRow(r).getCell(c);
      td.textContent = cellToString(cell.value);
      td.contentEditable = "true";
      td.dataset.row = r;
      td.dataset.col = c;
      td.addEventListener("blur", onCellEdit);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);
}

function cellToString(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    if (v.richText) return v.richText.map((p) => p.text).join("");
    if (v.text) return v.text;
    if (v.result !== undefined) return String(v.result);
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (v.formula) return `=${v.formula}`;
    return JSON.stringify(v);
  }
  return String(v);
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
