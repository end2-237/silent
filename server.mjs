// Serveur statique minimal pour le dossier « out/ ».
//
// L'application est exportée en statique : « next start » ne sait pas la
// servir. Plutôt qu'une dépendance de plus, une cinquantaine de lignes de
// Node suffisent — et il n'y a rien à installer sur le serveur.
//
// Usage : npm run build && npm start   (PORT, par défaut 3000)

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve("out");
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/** Résout une URL vers un fichier existant, sans jamais sortir de out/. */
function locate(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return null;
  }
  const candidate = resolve(join(ROOT, normalize(decoded)));
  if (candidate !== ROOT && !candidate.startsWith(ROOT + "/")) return null; // traversée

  for (const file of [candidate, join(candidate, "index.html"), `${candidate}.html`]) {
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

function cacheControl(file) {
  if (file.endsWith("/sw.js")) return "no-cache, no-store, must-revalidate";
  if (file.includes("/_next/static/")) return "public, max-age=31536000, immutable";
  if (file.includes("/icons/")) return "public, max-age=604800";
  return "public, max-age=0, must-revalidate";
}

function send(response, file, status = 200) {
  response.writeHead(status, {
    "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
    "Content-Length": statSync(file).size,
    "Cache-Control": cacheControl(file),
  });
  createReadStream(file).pipe(response);
}

createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  const file = locate(request.url ?? "/");
  if (file) {
    send(response, file);
    return;
  }

  const notFound = join(ROOT, "404.html");
  if (existsSync(notFound)) {
    send(response, notFound, 404);
    return;
  }
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("404");
}).listen(PORT, HOST, () => {
  console.log(`SILENT sur http://${HOST}:${PORT} (dossier ${ROOT})`);
});
