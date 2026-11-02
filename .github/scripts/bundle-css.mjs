#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════
//  Junta as folhas de estilo da página em um único arquivo (build)
//
//  O PageSpeed apontava 4 CSS bloqueando a renderização (fontawesome,
//  aos, bootstrap-icons, styles). No pacote publicado eles viram um só
//  assets/css/bundle.css — 1 requisição em vez de 4 — e o HTML passa a
//  apontar para ele. O código-fonte continua com os arquivos separados.
//
//  Uso: node .github/scripts/bundle-css.mjs <pasta-do-site>
// ══════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, resolve, posix, sep } from "node:path";

const OUT = resolve(process.argv[2] || "_site");
const BUNDLE = "assets/css/bundle.css";
// Ordem = ordem de cascata no <head>
const SHEETS = [
  "assets/vendor/fontawesome/fontawesome.css",
  "assets/vendor/aos/aos.css",
  "assets/vendor/bootstrap-icons/bootstrap-icons.css",
  "assets/css/styles.css",
];

const toPosix = (p) => p.split(sep).join(posix.sep);

// Reescreve url(...) relativos para continuarem válidos a partir de assets/css/
let css = "";
for (const sheet of SHEETS) {
  const file = join(OUT, sheet);
  const src = readFileSync(file, "utf8").replace(/@charset[^;]+;/gi, "");
  css += `/* ${sheet} */\n` + src.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/g, (m, q, ref) => {
    if (/^(data:|https?:|\/|#)/i.test(ref)) return m;
    const [path, suffix = ""] = ref.split(/(?=[?#])/);
    const abs = resolve(dirname(file), path);
    return `url(${q}${toPosix(relative(join(OUT, "assets/css"), abs))}${suffix}${q})`;
  }) + "\n";
}
writeFileSync(join(OUT, BUNDLE), css);

// Troca os 4 <link> pelo bundle em cada HTML que usa todos eles
const linkRe = /[ \t]*<link\b[^>]*\brel=["']stylesheet["'][^>]*>\s*\n?/gi;
function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (n.endsWith(".html")) out.push(p);
  }
  return out;
}
let pages = 0;
for (const page of walk(OUT)) {
  let html = readFileSync(page, "utf8");
  const links = [...html.matchAll(linkRe)].filter((m) => SHEETS.some((s) => m[0].includes(s.split("/").pop())));
  if (links.length !== SHEETS.length) continue;
  const prefix = toPosix(relative(dirname(page), OUT)) || ".";
  const indent = links[0][0].match(/^[ \t]*/)[0];
  const tag = `${indent}<link href="${prefix}/${BUNDLE}" rel="stylesheet">\n`;
  let first = true;
  html = html.replace(linkRe, (m) => {
    if (!links.some((l) => l[0] === m)) return m;
    if (first) { first = false; return tag; }
    return "";
  });
  writeFileSync(page, html);
  pages++;
}
console.log(`🎨 ${SHEETS.length} CSS → ${BUNDLE} (${css.length} bytes) em ${pages} página(s)`);
if (!pages) process.exit(1);
