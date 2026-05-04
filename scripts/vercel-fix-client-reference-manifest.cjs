/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

/**
 * Bazı build’lerde `app/(marketing)/page.tsx` olmadığı için bu manifest eksik kalabiliyor.
 * Eski düzeltme `module.exports = {}` yazıyordu — Next.js bunu vm içinde eval ederken
 * `module` tanımlı olmadığı için Vercel’de ReferenceError veriyordu.
 * Gerçek manifest formatı: globalThis.__RSC_MANIFEST (bkz. load-manifest.external.js).
 */

const EMPTY_SEGMENT_MANIFEST = {
  moduleLoading: { prefix: "/_next/" },
  ssrModuleMapping: {},
  edgeSSRModuleMapping: {},
  clientModules: {},
  entryCSSFiles: {},
  rscModuleMapping: {},
  edgeRscModuleMapping: {},
};

function main() {
  const root = process.cwd();
  const target = path.join(root, ".next", "server", "app", "(marketing)", "page_client-reference-manifest.js");
  if (!fs.existsSync(path.dirname(target))) {
    return;
  }
  const payload = JSON.stringify(EMPTY_SEGMENT_MANIFEST);
  const contents =
    `globalThis.__RSC_MANIFEST=(globalThis.__RSC_MANIFEST||{});` +
    `globalThis.__RSC_MANIFEST["/(marketing)/page"]=${payload};` +
    "\n";
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const prev = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
  if (prev !== contents) {
    fs.writeFileSync(target, contents, "utf8");
    console.log("[postbuild] wrote", target);
  }
}

main();
