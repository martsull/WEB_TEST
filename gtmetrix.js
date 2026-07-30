import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { sanitizeFilename, escapeCsv, buildPageInfo, fetchHtml } from './lib.js';

try {
  process.loadEnvFile();
} catch {
  // .env отсутствует — не критично, ключ можно передать через --key= или обычную переменную окружения
}

const API_BASE = 'https://gtmetrix.com/api/2.0';

function parseArgs(argv) {
  const args = {
    outDir: 'report',
    pagesFile: null,
    key: process.env.GTMETRIX_API_KEY || null,
    location: null,
    browser: null,
    pollInterval: 3000,
    maxWait: 180000,
    retries: 3,
  };
  for (const a of argv) {
    if (a.startsWith('--out=')) args.outDir = a.split('=')[1];
    else if (a.startsWith('--pages=')) args.pagesFile = a.split('=')[1];
    else if (a.startsWith('--key=')) args.key = a.split('=')[1];
    else if (a.startsWith('--location=')) args.location = a.split('=')[1];
    else if (a.startsWith('--browser=')) args.browser = a.split('=')[1];
    else if (a.startsWith('--poll-interval=')) args.pollInterval = Number(a.split('=')[1]) || 3000;
    else if (a.startsWith('--max-wait=')) args.maxWait = Number(a.split('=')[1]) || 180000;
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

function authHeader(key) {
  return 'Basic ' + Buffer.from(`${key}:`).toString('base64');
}

function apiErrorMessage(body, status) {
  const err = body?.errors?.[0];
  return err?.detail || err?.title || `HTTP ${status}`;
}

async function submitTest(url, args) {
  const attributes = { url, report: 'lighthouse' };
  if (args.location) attributes.location = args.location;
  if (args.browser) attributes.browser = args.browser;

  for (let attempt = 0; attempt <= args.retries; attempt++) {
    const res = await fetch(`${API_BASE}/tests`, {
      method: 'POST',
      headers: {
        Authorization: authHeader(args.key),
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({ data: { type: 'test', attributes } }),
    });

    if (res.status === 202) {
      const body = await res.json();
      return body.data.id;
    }

    const body = await res.json().catch(() => ({}));
    const message = apiErrorMessage(body, res.status);

    if ((res.status === 429 || res.status >= 500) && attempt < args.retries) {
      const resetSeconds = Number(res.headers.get('x-ratelimit-reset'));
      const wait = resetSeconds > 0 ? resetSeconds * 1000 : 5000 * Math.pow(2, attempt);
      process.stdout.write(`(лимит/ошибка сервера, жду ${Math.round(wait / 1000)}с) `);
      await sleep(wait);
      continue;
    }
    throw new Error(message);
  }
}

async function pollTest(testId, args) {
  const deadline = Date.now() + args.maxWait;
  while (Date.now() < deadline) {
    const res = await fetch(`${API_BASE}/tests/${testId}`, {
      headers: { Authorization: authHeader(args.key) },
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(apiErrorMessage(body, res.status));

    if (body?.data?.type === 'report') return body.data;

    const state = body?.data?.attributes?.state;
    if (state === 'error') {
      throw new Error(body?.data?.attributes?.error || 'GTmetrix: тест завершился с ошибкой');
    }
    await sleep(args.pollInterval);
  }
  throw new Error('Превышено время ожидания результата GTmetrix (--max-wait=)');
}

function buildSummaryRow(report) {
  const a = report.attributes || {};
  const links = report.links || {};
  return {
    grade: a.gtmetrix_grade ?? null,
    gtmetrixScore: a.gtmetrix_score ?? null,
    performanceScore: a.performance_score ?? null,
    structureScore: a.structure_score ?? null,
    lcp: a.largest_contentful_paint ?? null,
    tbt: a.total_blocking_time ?? null,
    cls: a.cumulative_layout_shift ?? null,
    fcp: a.first_contentful_paint ?? null,
    tti: a.time_to_interactive ?? null,
    speedIndex: a.speed_index ?? null,
    ttfb: a.time_to_first_byte ?? null,
    onload: a.onload_time ?? null,
    fullyLoaded: a.fully_loaded_time ?? null,
    pageBytes: a.page_bytes ?? null,
    pageRequests: a.page_requests ?? null,
    reportUrl: links.report_url ?? null,
  };
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
    console.error(
      'Не найден API-ключ GTmetrix (GTMETRIX_API_KEY). Укажите его через --key=ВАШ_КЛЮЧ, переменную окружения ' +
        'или .env файл.\nКлюч доступен в личном кабинете: https://gtmetrix.com/api/ ("API Key" на странице аккаунта).\n' +
        'Учтите: каждый тест расходует кредиты аккаунта GTmetrix.',
    );
    process.exit(1);
  }

  fs.mkdirSync(path.join(outDir, 'gtmetrix-reports'), { recursive: true });

  const csvPath = path.join(outDir, 'gtmetrix-summary.csv');
  const jsonPath = path.join(outDir, 'gtmetrix-summary.json');
  const csvHeader =
    'url,grade,gtmetrix_score,performance_score,structure_score,lcp_ms,tbt_ms,cls,fcp_ms,tti_ms,speed_index_ms,ttfb_ms,onload_ms,fully_loaded_ms,page_bytes,page_requests,report_url,report_json\n';
  fs.writeFileSync(csvPath, csvHeader);
  const summary = [];

  process.stdout.write(`Страниц к проверке через GTmetrix: ${pages.length}\n\n`);

  for (let i = 0; i < pages.length; i++) {
    const url = pages[i];
    const filenameBase = sanitizeFilename(url, i + 1);
    process.stdout.write(`[${i + 1}/${pages.length}] ${url} ... `);

    try {
      const fetched = await fetchHtml(url);
      const testId = await submitTest(url, args);
      const report = await pollTest(testId, args);

      const reportPath = path.join(outDir, 'gtmetrix-reports', `${filenameBase}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      const row = buildSummaryRow(report);
      const page = buildPageInfo(url, fetched);
      summary.push({ page, gtmetrix: { ...row, reportPath } });

      const line =
        [
          url,
          row.grade,
          row.gtmetrixScore,
          row.performanceScore,
          row.structureScore,
          row.lcp,
          row.tbt,
          row.cls,
          row.fcp,
          row.tti,
          row.speedIndex,
          row.ttfb,
          row.onload,
          row.fullyLoaded,
          row.pageBytes,
          row.pageRequests,
          row.reportUrl,
          path.relative(outDir, reportPath),
        ]
          .map(escapeCsv)
          .join(',') + '\n';
      fs.appendFileSync(csvPath, line);

      process.stdout.write(
        `готово | grade:${row.grade} perf:${row.performanceScore} structure:${row.structureScore} ` +
          `LCP:${row.lcp}ms TBT:${row.tbt}ms CLS:${row.cls}\n`,
      );
    } catch (err) {
      process.stdout.write(`ОШИБКА: ${err.message}\n`);
      summary.push({ url, error: err.message });
    }
    fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));
  }

  process.stdout.write(
    `\nГотово. Обработано страниц: ${pages.length}\nСводка с деталями: ${jsonPath}\nСводка (CSV): ${csvPath}\nСырые ответы API: ${path.join(outDir, 'gtmetrix-reports')}\n`,
  );
}

try {
  await main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
