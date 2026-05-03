/**
 * İş bitince bip + konsola yazı (PowerShell zorunlu değil).
 *
 * Kullanım:
 *   node scripts/notify-done.cjs
 *   node scripts/notify-done.cjs Build tamamlandi
 *   npm run build:notify
 */

const { execFileSync } = require("child_process");

const msg =
  process.argv.slice(2).join(" ").trim() || "Tamamlandı";

process.stdout.write("\n");
process.stdout.write("\x1b[32m✓ " + msg + "\x1b[0m\n\n");
process.stdout.write("\x07"); // terminal zili (destekleyen terminallerde)

if (process.platform === "win32") {
  try {
    execFileSync(
      "rundll32.exe",
      ["user32.dll,MessageBeep"],
      { stdio: "ignore", windowsHide: true }
    );
  } catch {
    /* sessiz geç */
  }
}
