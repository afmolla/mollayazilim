"use strict";
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", ".next");
try {
  fs.rmSync(dir, { recursive: true, force: true });
  process.stdout.write("OK: .next silindi\n");
} catch (e) {
  if (e && e.code === "ENOENT") process.stdout.write("OK: .next yoktu\n");
  else throw e;
}
