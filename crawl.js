import fs from 'node:fs';
import path from 'node:path';
import { load as loadHtml } from 'cheerio';
import { SKIP_EXT, normalizeUrl, fetchHtml } from './lib.js';

function parseArgs(argv) {
  const args = { maxPages: Infinity, outDir: 'report', concurrency: 5 };
  const positional = [];
  for (const a of argv) {
    if (a.startsWith('--max-pages=')) args.maxPages = Number(a.split('=')[1]) || Infinity;
    else if (a.startsWith('--out=')) args.outDir = a.split('=')[1];
    else if (a.startsWith('--concurrency=')) args.concurrency = Number(a.split('=')[1]) || 5;
    else positional.push(a);
  }
  args.startUrl = positional[0];
  return args;
}

async function crawlSite(startUrl, { maxPages, concurrency }) {
  const start = normalizeUrl(startUrl);
  const origin = new URL(start).origin;
  const visited = new Set([start]);
  const queue = [start];
  const discovered = [start];
  let active = 0;
  let idx = 0;

  process.stdout.write(`Обход сайта: ${origin}\n`);

  await new Promise((resolve) => {
    const next = () => {
      if (idx >= queue.length && active === 0) {
        resolve();
        return;
      }
      while (active < concurrency && idx < queue.length && discovered.length < maxPages) {
        const url = queue[idx++];
        active++;
        fetchHtml(url).then((result) => {
          active--;
          if (result?.html) {
            const $ = loadHtml(result.html);
            $('a[href]').each((_, el) => {
              if (discovered.length >= maxPages) return;
              const href = $(el).attr('href');
              if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
              let abs;
              try {
                abs = normalizeUrl(new URL(href, result.finalUrl).toString());
              } catch {
                return;
              }
              if (new URL(abs).origin !== origin) return;
              if (SKIP_EXT.test(abs)) return;
              if (!visited.has(abs)) {
                visited.add(abs);
                queue.push(abs);
                discovered.push(abs);
              }
            });
          }
          process.stdout.write(`\rНайдено страниц: ${discovered.length} | в очереди: ${queue.length - idx}   `);
          next();
        });
      }
    };
    next();
  });

  process.stdout.write(`\nОбход завершён. Всего страниц: ${discovered.length}\n\n`);
  return discovered;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.startUrl) {
    console.error('Использование: node crawl.js <url> [--out=./dir] [--max-pages=N] [--concurrency=5]');
    process.exit(1);
  }

  const outDir = path.resolve(args.outDir);
  fs.mkdirSync(outDir, { recursive: true });

  const pages = await crawlSite(args.startUrl, { maxPages: args.maxPages, concurrency: args.concurrency });

  const jsonPath = path.join(outDir, 'pages.json');
  const txtPath = path.join(outDir, 'pages.txt');
  fs.writeFileSync(jsonPath, JSON.stringify(pages, null, 2));
  fs.writeFileSync(txtPath, pages.join('\n') + '\n');

  process.stdout.write(`Список страниц сохранён:\n  ${jsonPath}\n  ${txtPath}\n\nДалее запустите: node lighthouse.js --out=${args.outDir}\n`);
}

try {
  await main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
