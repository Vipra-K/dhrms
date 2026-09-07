import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
const extensions = [".js", ".jsx", ".ts", ".tsx", ".json"];
const sourceExtensions = new Set([".js", ".jsx"]);
const failures = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (sourceExtensions.has(path.extname(entry.name))) checkFile(full);
  }
}

function exactEntry(dir, name) {
  try {
    return fs.readdirSync(dir).find((entry) => entry === name) || null;
  } catch {
    return null;
  }
}

function resolveImport(fromFile, specifier) {
  if (!specifier.startsWith(".")) return true;
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [base, ...extensions.map((ext) => `${base}${ext}`), ...extensions.map((ext) => path.join(base, `index${ext}`))];
  const target = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (!target) {
    failures.push(`${path.relative(root, fromFile)} -> unresolved ${specifier}`);
    return false;
  }

  const relative = path.relative(root, target);
  const segments = relative.split(path.sep);
  let current = root;
  for (const segment of segments) {
    const actual = exactEntry(current, segment);
    if (!actual) {
      failures.push(`${path.relative(root, fromFile)} -> ${specifier} has case mismatch near ${segment}`);
      return false;
    }
    current = path.join(current, actual);
  }
  return true;
}

function checkFile(file) {
  const source = fs.readFileSync(file, "utf8");
  const regex = /(?:from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\))/g;
  for (const match of source.matchAll(regex)) resolveImport(file, match[1] || match[2]);
}

walk(root);
if (failures.length) {
  console.error("Frontend import check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Frontend relative imports are valid with exact filesystem casing.");
