#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════
//  Verificação de links LOCAIS do site estático (sem dependências)
//
//  Lê os HTML publicados e confere se cada href/src/srcset que aponta
//  para o próprio site (relativo, "/..." ou https://josenilto.github.io/...)
//  existe no disco, e se cada âncora "#id" da mesma página existe.
//  Também confere os url(...) dos CSS próprios (fontes, imagens).
//
//  Uso:  node .github/scripts/check-links.mjs [pasta]   (padrão: .)
//  Saída: lista de links quebrados; exit 1 se houver algum.
//
//  Links conhecidos e aceitos temporariamente ficam em
//  .github/linkcheck-ignore.txt (um caminho por linha) — viram aviso.
// ══════════════════════════════════════════════════════════════════
import { readFileSync, existsSync, statSync, readdirSync, appendFileSync } from "node:fs";
import { join, dirname, resolve, relative, extname } from "node:path";

const ROOT = resolve(process.argv[2] || ".");
const SITE = "https://josenilto.github.io";
const IGNORE_FILE = resolve(".github/linkcheck-ignore.txt");
const SKIP_DIRS = new Set([".git", "node_modules", ".github", "api", "dist", ".docker"]);

const ignored = existsSync(IGNORE_FILE)
  ? readFileSync(IGNORE_FILE, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
  : [];

function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.includes(extname(name))) out.push(p);
  }
  return out;
}

// Converte uma referência em caminho no disco; null = externo/ignorável.
function toPath(ref, fromFile) {
  ref = ref.trim();
  if (!ref || /^(#|mailto:|tel:|javascript:|data:|blob:|about:)/i.test(ref)) return null;
  if (ref.startsWith(SITE)) ref = ref.slice(SITE.length) || "/";
  else if (/^([a-z]+:)?\/\//i.test(ref)) return null; // outro domínio
  const clean = decodeURI(ref.split("#")[0].split("?")[0]);
  if (!clean) return null;
  let p = clean.startsWith("/") ? join(ROOT, clean) : join(dirname(fromFile), clean);
  if (clean.endsWith("/") || (existsSync(p) && statSync(p).isDirectory())) p = join(p, "index.html");
  return p;
}

const broken = [];
const warned = [];
let checked = 0;

function check(ref, fromFile) {
  const p = toPath(ref, fromFile);
  if (!p) return;
  checked++;
  if (existsSync(p)) return;
  const rel = "/" + relative(ROOT, p);
  const entry = { ref, from: relative(ROOT, fromFile) };
  if (ignored.some((i) => rel === i || rel.startsWith(i))) warned.push(entry);
  else broken.push(entry);
}

for (const file of walk(ROOT, [".html"])) {
  const html = readFileSync(file, "utf8");
  const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]));

  for (const m of html.matchAll(/\s(?:href|src)=["']([^"']*)["']/g)) {
    const ref = m[1];
    if (ref.startsWith("#") && ref.length > 1) {
      checked++;
      if (!ids.has(decodeURIComponent(ref.slice(1)))) broken.push({ ref, from: relative(ROOT, file) });
    } else check(ref, file);
  }
  for (const m of html.matchAll(/\ssrcset=["']([^"']*)["']/g)) {
    for (const part of m[1].split(",")) check(part.trim().split(/\s+/)[0], file);
  }
}

for (const file of walk(join(ROOT, "assets"), [".css"])) {
  const css = readFileSync(file, "utf8");
  for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) check(m[1], file);
}

const summary = process.env.GITHUB_STEP_SUMMARY;
const log = (s) => summary && appendFileSync(summary, s + "\n");

for (const w of warned) {
  console.log(`::warning title=Link ignorado::${w.ref} (em ${w.from}) não existe — listado em .github/linkcheck-ignore.txt`);
}
log(`## 🔗 Links locais\n\n| Verificados | Quebrados | Ignorados |\n| --- | --- | --- |\n| ${checked} | ${broken.length} | ${warned.length} |\n`);

if (broken.length) {
  console.error(`❌ ${broken.length} link(s) local(is) quebrado(s) de ${checked}:`);
  for (const b of broken) {
    console.error(`  • ${b.ref}  (em ${b.from})`);
    console.log(`::error file=${b.from},title=Link quebrado::${b.ref}`);
  }
  log(broken.map((b) => `- ❌ \`${b.ref}\` em \`${b.from}\``).join("\n"));
  process.exit(1);
}
console.log(`✅ ${checked} links locais OK${warned.length ? ` (${warned.length} ignorado(s))` : ""}`);
