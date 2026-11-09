import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const taxonomy = JSON.parse(readFileSync(new URL("./taxonomy/v0.1.json", import.meta.url)));
const read = path => readFileSync(path, "utf8");
const hash = text => createHash("sha256").update(text).digest("hex");
function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function init(mode, source, call) {
  requireValue(["call", "application"].includes(mode), "Use call or application.");
  requireValue(source.trim(), "Source text is empty.");
  if (mode === "application") requireValue(call?.trim(), "Application review needs the original call text.");
  return {
    version: taxonomy.version, mode, sourceHash: hash(source),
    callHash: mode === "application" ? hash(call) : null,
    title: "", reviewer: "", scope: "",
    findings: taxonomy.criteria.map(c => ({
      id: c.id, question: c[mode], score: null, rationale: "", quote: "", callQuote: "", edit: null
    }))
  };
}

function render(review, source, call) {
  const expected = init(review.mode, source, call);
  requireValue(review.version === expected.version && review.sourceHash === expected.sourceHash &&
    review.callHash === expected.callHash, "Source, original call or rubric version differs.");
  for (const field of ["title","reviewer","scope"]) requireValue(typeof review[field] === "string" && review[field].trim(), "Missing " + field);
  requireValue(Array.isArray(review.findings) && review.findings.length === expected.findings.length, "Incomplete criteria list.");
  const sections = [];
  const seen = new Set();
  let earned = 0, assessed = 0;
  for (const f of review.findings) {
    const criterion = taxonomy.criteria.find(c => c.id === f.id);
    requireValue(criterion && !seen.has(f.id), "Unknown or repeated criterion: " + f.id);
    seen.add(f.id);
    requireValue([null,0,1,2].includes(f.score) && typeof f.rationale === "string" && f.rationale.trim(), "Supply a score or null and a rationale for " + f.id);
    requireValue(typeof f.quote === "string" && (!f.quote || source.includes(f.quote)), "Source quote mismatch: " + f.id);
    if (f.score > 0) requireValue(f.quote.trim(), "Positive scores need source evidence: " + f.id);
    requireValue(typeof f.callQuote === "string" && (!f.callQuote || (review.mode === "application" && call.includes(f.callQuote))), "Original call quote mismatch: " + f.id);
    if (review.mode === "application" && f.score !== null) {
      requireValue(typeof f.callQuote === "string" && f.callQuote.trim() && call.includes(f.callQuote), "Scored application findings need original call evidence: " + f.id);
    }
    const lines = ["## " + criterion.id + " · " + (f.score === null ? "unassessed" : f.score + "/2"), criterion[review.mode], f.rationale];
    if (f.quote) lines.push("Source passage: " + f.quote);
    if (f.callQuote) lines.push("Call passage: " + f.callQuote);
    if (f.edit !== null) {
      const e = f.edit;
      requireValue(["replace","insert-after"].includes(e?.action) && typeof e.anchor === "string" && e.anchor.trim() &&
        source.indexOf(e.anchor) >= 0 && source.indexOf(e.anchor) === source.lastIndexOf(e.anchor) &&
        typeof e.text === "string" && e.text.trim() && e.text !== e.anchor, "Edit needs one exact source anchor and new wording: " + f.id);
      lines.push("Suggested " + e.action + "\n\nOriginal: " + e.anchor + "\n\nProposed: " + e.text);
    }
    if (f.score !== null) { earned += f.score; assessed++; }
    sections.push(lines.join("\n\n"));
  }
  return ["# " + review.title, review.mode + " review · HCF rubric " + review.version,
    "Reviewer: " + review.reviewer, "Scope: " + review.scope,
    "Coverage: " + assessed + "/" + seen.size + " criteria. " + (assessed ? "Assessed points: " + earned + "/" + (2*assessed) : "No criteria assessed") +
      (assessed === seen.size ? "." : ". Partial review; no overall grade."), ...sections].join("\n\n");
}

try {
  const [command, first, file, callFile] = process.argv.slice(2);
  requireValue(["init","report"].includes(command) && first && file, "Usage: node review.mjs init call|application source.txt [original-call.txt] OR report review.json source.txt [original-call.txt]");
  const source = read(file);
  const call = callFile ? read(callFile) : null;
  console.log(command === "init" ? JSON.stringify(init(first, source, call), null, 2) : render(JSON.parse(read(first)), source, call));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
