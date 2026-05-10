#!/usr/bin/env node
/**
 * sync-tracker.mjs
 * Regenerates data/applications.md from the xlsx Applications sheet.
 * Score and report link are looked up from reports/ by matching company + role.
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const ROOT = dirname(fileURLToPath(import.meta.url));
const XLSX = join(ROOT, "Job_Hunting_Progress.xlsx");
const REPORTS_DIR = join(ROOT, "reports");
const OUTPUT = join(ROOT, "data", "applications.md");

// ---------------------------------------------------------------------------
// Read xlsx via python (openpyxl) — avoids adding a Node xlsx dependency
// ---------------------------------------------------------------------------
function readApplicationsSheet() {
  const script = `import json, openpyxl, sys
wb = openpyxl.load_workbook(sys.argv[1], read_only=True, data_only=True)
ws = wb["Applications"]
rows = []
for row in ws.iter_rows(min_row=2, values_only=True):
    company = row[2]
    if not company:
        continue
    rows.append({
        "date":    str(row[1])[:10] if row[1] else "",
        "company": str(company).strip(),
        "role":    str(row[3]).strip() if row[3] else "",
        "status":  str(row[7]).strip() if row[7] else "",
        "cv":      str(row[9]).strip() if row[9] else "",
        "notes":   str(row[16]).strip() if row[16] else "",
        "hide":    str(row[17]).strip() if row[17] else "",
    })
print(json.dumps(rows))
`;
  const tmp = join(tmpdir(), "sync_tracker_read.py");
  writeFileSync(tmp, script);
  const out = execSync(`python3 "${tmp}" "${XLSX}"`);
  return JSON.parse(out.toString());
}

// ---------------------------------------------------------------------------
// Build a lookup: (company_lower, role_fragment_lower) → { score, reportPath }
// by scanning all report files for **Score:** and **PDF:** headers
// ---------------------------------------------------------------------------
function buildReportIndex() {
  const index = [];
  if (!existsSync(REPORTS_DIR)) return index;

  for (const file of readdirSync(REPORTS_DIR)) {
    if (!file.endsWith(".md")) continue;
    const content = readFileSync(join(REPORTS_DIR, file), "utf8");

    const scoreMatch = content.match(/\*\*Score:\*\*\s*([\d.]+\/5)/);
    const companyMatch = content.match(/^#\s+Evaluation:\s+(.+?)\s+—/m);
    const roleMatch = content.match(/^#\s+Evaluation:.+?—\s+(.+)$/m);
    const pdfMatch = content.match(/\*\*PDF:\*\*\s*(.+)/);

    index.push({
      file,
      reportPath: `reports/${file}`,
      company: companyMatch ? companyMatch[1].trim().toLowerCase() : "",
      role: roleMatch ? roleMatch[1].trim().toLowerCase() : "",
      score: scoreMatch ? scoreMatch[1] : "",
      pdfPath: pdfMatch ? pdfMatch[1].trim() : "",
    });
  }
  return index;
}

function findReport(reportIndex, company, role) {
  const co = company.toLowerCase();
  const ro = role.toLowerCase();

  // Exact company match + role substring overlap
  const candidates = reportIndex.filter((r) => r.company === co);
  if (candidates.length === 0) return null;

  // Score each candidate by how many words from the role appear in the report role
  const roleWords = ro.split(/\W+/).filter((w) => w.length > 3);
  let best = null;
  let bestScore = 0;
  for (const c of candidates) {
    const hits = roleWords.filter((w) => c.role.includes(w)).length;
    if (hits > bestScore) {
      bestScore = hits;
      best = c;
    }
  }
  return bestScore > 0 ? best : candidates[0];
}

// ---------------------------------------------------------------------------
// Map xlsx status to canonical applications.md status
// ---------------------------------------------------------------------------
function canonicalStatus(raw) {
  const map = {
    applied: "Applied",
    evaluated: "Evaluated",
    responded: "Responded",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
    discarded: "Discarded",
    skip: "SKIP",
  };
  return map[raw.toLowerCase()] ?? raw;
}

// ---------------------------------------------------------------------------
// Determine PDF emoji: ✅ if a file exists at that path, else ❌
// ---------------------------------------------------------------------------
function pdfEmoji(cvUsed, reportPdfPath) {
  const candidate = cvUsed || reportPdfPath || "";
  if (!candidate) return "❌";
  const full = join(ROOT, candidate);
  return existsSync(full) ? "✅" : "❌";
}

// ---------------------------------------------------------------------------
// Escape pipe chars so markdown table cells don't break
// ---------------------------------------------------------------------------
const esc = (s) => (s ?? "").replace(/\|/g, "\\|");

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const rows = readApplicationsSheet().filter((r) => r.hide !== "1" && r.hide.toLowerCase() !== "true");
const reportIndex = buildReportIndex();

const lines = [
  "# Applications Tracker",
  "",
  "| # | Date | Company | Role | Score | Status | PDF | Report | Notes |",
  "|---|------|---------|------|-------|--------|-----|--------|-------|",
];

let seq = 1;
for (const row of rows) {
  const report = findReport(reportIndex, row.company, row.role);
  const score = report?.score ?? "";
  const reportNum = report ? report.file.match(/^(\d+)/)?.[1] : null;
  const reportLink = reportNum ? `[${parseInt(reportNum)}](${report.reportPath})` : "";
  const pdf = pdfEmoji(row.cv, report?.pdfPath ?? "");
  const status = canonicalStatus(row.status);

  lines.push(
    `| ${seq++} | ${esc(row.date)} | ${esc(row.company)} | ${esc(row.role)} | ${score} | ${status} | ${pdf} | ${reportLink} | ${esc(row.notes)} |`
  );
}

lines.push("");
writeFileSync(OUTPUT, lines.join("\n"), "utf8");
console.log(`✓ Wrote ${seq - 1} rows to data/applications.md`);
