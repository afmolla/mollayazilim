/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

/**
 * Vercel Next builder bazen `page_client-reference-manifest.js` dosyasını arıyor.
 * Bazı route-group’larda (örn. `app/(marketing)`) build çıktısında bu dosya oluşmayabiliyor.
 * Bu script eksikse minimal bir dosya oluşturur.
 */

function ensureFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, contents, "utf8");
    console.log("[postbuild] created", filePath);
  }
}

function main() {
  const root = process.cwd();
  const target = path.join(root, ".next", "server", "app", "(marketing)", "page_client-reference-manifest.js");
  ensureFile(target, "module.exports = {};\n");
}

main();

