// Minimal zero-dependency static file server for previewing and E2E-testing `out/`.
// Usage: node scripts/serve-static.mjs [dir=out] [port=3000]
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "out");
const port = Number(process.argv[3] ?? 3000);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

async function resolveFile(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, "");
  const base = join(root, safe);
  if (!base.startsWith(root)) return null;
  for (const candidate of [base, join(base, "index.html"), `${base}.html`]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

createServer(async (req, res) => {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;
  const file = (await resolveFile(path)) ?? (await resolveFile("/404.html"));
  if (!file) {
    res.writeHead(404).end("Not found");
    return;
  }
  const status = file.endsWith("404.html") && !path.endsWith("404.html") ? 404 : 200;
  res.writeHead(status, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`));
