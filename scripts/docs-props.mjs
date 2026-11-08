// Fills the props tables in docs/components/*.md from the TypeScript types in
// src/, so the documentation cannot drift from the code.
//   node scripts/docs-props.mjs          rewrite the tables
//   node scripts/docs-props.mjs --check  exit 1 if any table is out of date
// A table sits between `<!-- props:TypeName -->` and `<!-- /props -->`.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = join(root, "docs/components");
const check = process.argv.includes("--check");

const config = ts.getParsedCommandLineOfConfigFile(
  join(root, "tsconfig.json"),
  {},
  { ...ts.sys, onUnRecoverableConfigFileDiagnostic: (d) => { throw new Error(String(d.messageText)); } },
);
const program = ts.createProgram(config.fileNames, config.options);
const checker = program.getTypeChecker();
const index = program.getSourceFile(join(root, "src/index.ts"));
const exported = new Map(
  checker.getExportsOfModule(checker.getSymbolAtLocation(index)).map((s) => [s.name, s]),
);

const cell = (text) => text.replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
const code = (text) => `\`${cell(text).replace(/`/g, "")}\``;

function table(name) {
  const symbol = exported.get(name);
  if (!symbol) throw new Error(`${name} is not exported from src/index.ts`);
  const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  const type = checker.getDeclaredTypeOfSymbol(resolved);
  const own = type.getProperties().filter((prop) =>
    (prop.declarations ?? []).some((d) => {
      const file = d.getSourceFile().fileName;
      return file.startsWith(join(root, "src")) && !file.includes("node_modules");
    }),
  );
  if (own.length === 0) throw new Error(`${name} has no props declared in src/`);
  const rows = own.map((prop) => {
    const decl = prop.declarations[0];
    const typeText = decl.type
      ? decl.type.getText()
      : checker.typeToString(checker.getTypeOfSymbol(prop), undefined, ts.TypeFormatFlags.NoTruncation);
    const required = !(prop.flags & ts.SymbolFlags.Optional);
    const doc = ts.displayPartsToString(prop.getDocumentationComment(checker));
    return `| ${code(prop.name)} | ${code(typeText)} | ${required ? "yes" : "no"} | ${cell(doc)} |`;
  });
  return ["| Prop | Type | Required | Notes |", "| --- | --- | --- | --- |", ...rows].join("\n");
}

let stale = 0;
for (const file of readdirSync(docsDir).filter((f) => f.endsWith(".md"))) {
  const path = join(docsDir, file);
  const before = readFileSync(path, "utf8");
  const after = before.replace(
    /<!-- props:(\w+) -->\n[\s\S]*?<!-- \/props -->/g,
    (_, name) => `<!-- props:${name} -->\n${table(name)}\n<!-- /props -->`,
  );
  if (after !== before) {
    stale += 1;
    if (check) console.error(`docs/components/${file}: props tables are out of date`);
    else writeFileSync(path, after);
  }
}
if (check && stale) {
  console.error("Run: npm run docs");
  process.exit(1);
}
console.log(check ? "Props tables are up to date." : `Updated ${stale} file(s).`);
