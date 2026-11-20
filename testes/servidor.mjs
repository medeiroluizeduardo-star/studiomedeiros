// Servidor simples da pasta public/ (ou de outra pasta, como o site montado de outro estúdio), igual ao Firebase Hosting com cleanUrls (/catalogo abre catalogo.html).
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('../public/', import.meta.url));
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

async function existe(p) { try { return (await stat(p)).isFile(); } catch { return false; } }

export function iniciar(porta = 0, raiz = RAIZ) {
  const RZ = raiz.endsWith('/') ? raiz : raiz + '/';
  const srv = http.createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    let arq = normalize(join(RZ, p));
    if (!arq.startsWith(RZ)) { res.writeHead(403).end(); return; }
    if (!(await existe(arq)) && !extname(arq) && await existe(arq + '.html')) arq += '.html';
    if (!(await existe(arq))) { res.writeHead(404, { 'content-type': 'text/plain' }).end('404'); return; }
    res.writeHead(200, { 'content-type': TIPOS[extname(arq)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(await readFile(arq));
  });
  return new Promise(ok => srv.listen(porta, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${srv.address().port}`, fechar: () => new Promise(f => srv.close(f)) })));
}
