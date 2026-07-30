import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { sanitizeFilename, escapeCsv, fetchHtml, buildDetailReport, buildPageInfo } from './lib.js';

try {
  process.loadEnvFile();
} catch {
  // .env отсутствует — не критично, ключ можно передать через --key= или обычную переменную окружения
}

const API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];

function parseArgs(argv) {
  const args = {
    outDir: 'report',
    pagesFile: null,
    key: process.env.PAGESPEED_API_KEY || null,
    delay: 1500,
    retries: 3,
  };
  for (const a of argv) {
    if (a.startsWith('--out=')) args.outDir = a.split('=')[1];
    else if (a.startsWith('--pages=')) args.pagesFile = a.split('=')[1];
    else if (a.startsWith('--key=')) args.key = a.split('=')[1];
    else if (a.startsWith('--delay=')) args.delay = Number(a.split('=')[1]) || 1500;
    else if (a.startsWith('--retries=')) args.retries = Number(a.split('=')[1]) || 3;
  }
  return args;
}

function loadPages(pagesFile) {
  if (pagesFile.endsWith('.json')) {
    return JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
  }
  return fs
    .readFileSync(pagesFile, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPageSpeed(url, strategy, key, retries) {
  const apiUrl = new URL(API_URL);
  apiUrl.searchParams.set('url', url);
  apiUrl.searchParams.set('strategy', strategy);
  for (const cat of CATEGORIES) apiUrl.searchParams.append('category', cat);
  if (key) apiUrl.searchParams.set('key', key);

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(apiUrl.toString());
    if (res.ok) return res.json();

    const body = await res.json().catch(() => ({}));
    const message = body?.error?.message || `HTTP ${res.status}`;

    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const wait = 5000 * Math.pow(2, attempt);
      process.stdout.write(`(лимит/ошибка сервера, жду ${wait / 1000}с) `);
      await sleep(wait);
      continue;
    }
    throw new Error(message);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(args.outDir);
  const pagesFile = args.pagesFile ? path.resolve(args.pagesFile) : path.join(outDir, 'pages.json');

  if (!fs.existsSync(pagesFile)) {
    console.error(`Файл со списком страниц не найден: ${pagesFile}`);
    console.error('Сначала запустите: node crawl.js <url> --out=' + args.outDir);
    process.exit(1);
  }

  const pages = loadPages(pagesFile);
  if (!pages.length) {
    console.error('Список страниц пуст.');
    process.exit(1);
  }

  if (!args.key) {
    process.stdout.write(
      'Внимание: запуск без --key= (API-ключ PageSpeed Insights). Без ключа очень низкая квота запросов ' +
        'и высок риск ошибок 429 на большом списке страниц.\n' +
        'Бесплатный ключ: https://developers.google.com/speed/docs/insights/v5/get-started -> "Get a Key"\n' +
        'Использование: node pagespeed.js --key=ВАШ_КЛЮЧ\n\n',
    );
  }

  fs.mkdirSync(path.join(outDir, 'psi-reports'), { recursive: true });

  const csvPath = path.join(outDir, 'psi-summary.csv');
  const jsonPath = path.join(outDir, 'psi-summary.json');
  const csvHeader =
    'url,mobile_performance,mobile_accessibility,mobile_best_practices,mobile_seo,desktop_performance,desktop_accessibility,desktop_best_practices,desktop_seo,mobile_report,desktop_report\n';
  fs.writeFileSync(csvPath, csvHeader);
  const summary = [];

  process.stdout.write(`Страниц к проверке через PageSpeed Insights: ${pages.length}\n\n`);

  for (let i = 0; i < pages.length; i++) {
    const url = pages[i];
    const filenameBase = sanitizeFilename(url, i + 1);
    process.stdout.write(`[${i + 1}/${pages.length}] ${url} ... `);

    const fetched = await fetchHtml(url);
    const html = fetched?.html ?? null;

    const results = {};
    let errorMessage = null;

    for (const strategy of ['mobile', 'desktop']) {
      try {
        const data = await fetchPageSpeed(url, strategy, args.key, args.retries);
        const reportPath = path.join(outDir, 'psi-reports', `${filenameBase}-${strategy}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(data, null, 2));

        const detail = buildDetailReport({ url, device: strategy, lhr: data.lighthouseResult, html, page: fetched });
        results[strategy] = { ...detail, reportPath };
      } catch (err) {
        errorMessage = err.message;
        break;
      }
      await sleep(args.delay);
    }

    if (errorMessage) {
      process.stdout.write(`ОШИБКА: ${errorMessage}\n`);
      summary.push({ url, error: errorMessage });
    } else {
      const page = buildPageInfo(url, fetched);
      summary.push({ page, mobile: results.mobile, desktop: results.desktop });
      const line =
        [
          url,
          results.mobile.scores.performance.score,
          results.mobile.scores.accessibility.score,
          results.mobile.scores.bestPractices.score,
          results.mobile.scores.seo.score,
          results.desktop.scores.performance.score,
          results.desktop.scores.accessibility.score,
          results.desktop.scores.bestPractices.score,
          results.desktop.scores.seo.score,
          path.relative(outDir, results.mobile.reportPath),
          path.relative(outDir, results.desktop.reportPath),
        ]
          .map(escapeCsv)
          .join(',') + '\n';
      fs.appendFileSync(csvPath, line);
      process.stdout.write(
        `готово | mobile P:${results.mobile.scores.performance.score} A:${results.mobile.scores.accessibility.score} BP:${results.mobile.scores.bestPractices.score} SEO:${results.mobile.scores.seo.score} ` +
          `| desktop P:${results.desktop.scores.performance.score} A:${results.desktop.scores.accessibility.score} BP:${results.desktop.scores.bestPractices.score} SEO:${results.desktop.scores.seo.score}\n`,
      );
    }
    fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));
  }

  process.stdout.write(
    `\nГотово. Обработано страниц: ${pages.length}\nСводка с деталями: ${jsonPath}\nСводка (CSV): ${csvPath}\nСырые ответы API: ${path.join(outDir, 'psi-reports')}\n`,
  );
}

try {
  await main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
