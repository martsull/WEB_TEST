import fs from 'node:fs';
import path from 'node:path';
import lighthouse, { desktopConfig } from 'lighthouse';
import { launch as launchChrome } from 'chrome-launcher';
import { sanitizeFilename, escapeCsv, fetchHtml, buildDetailReport, buildPageInfo } from './lib.js';

function parseArgs(argv) {
  const args = { outDir: 'report', pagesFile: null };
  for (const a of argv) {
    if (a.startsWith('--out=')) args.outDir = a.split('=')[1];
    else if (a.startsWith('--pages=')) args.pagesFile = a.split('=')[1];
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

async function runLighthouseForUrl(url, port, outDir, index, fetched) {
  const filenameBase = sanitizeFilename(url, index);
  const results = {};
  for (const device of ['mobile', 'desktop']) {
    const config = device === 'desktop' ? desktopConfig : undefined;
    const runnerResult = await lighthouse(
      url,
      {
        port,
        output: 'html',
        logLevel: 'silent',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
      config,
    );
    const reportPath = path.join(outDir, 'reports', `${filenameBase}-${device}.html`);
    fs.writeFileSync(reportPath, runnerResult.report);

    const detail = buildDetailReport({ url, device, lhr: runnerResult.lhr, html: fetched?.html ?? null, page: fetched });
    results[device] = { ...detail, reportPath };
  }
  return results;
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

  fs.mkdirSync(path.join(outDir, 'reports'), { recursive: true });

  const csvPath = path.join(outDir, 'summary.csv');
  const jsonPath = path.join(outDir, 'summary.json');
  const csvHeader =
    'url,mobile_performance,mobile_accessibility,mobile_best_practices,mobile_seo,desktop_performance,desktop_accessibility,desktop_best_practices,desktop_seo,mobile_report,desktop_report\n';
  fs.writeFileSync(csvPath, csvHeader);
  const summary = [];

  process.stdout.write(`Страниц к проверке: ${pages.length}\n`);

  const chrome = await launchChrome({ chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
  process.stdout.write(`Chrome запущен (port ${chrome.port})\n\n`);

  try {
    for (let i = 0; i < pages.length; i++) {
      const url = pages[i];
      process.stdout.write(`[${i + 1}/${pages.length}] ${url} ... `);
      try {
        const fetched = await fetchHtml(url);
        const result = await runLighthouseForUrl(url, chrome.port, outDir, i + 1, fetched);
        const page = buildPageInfo(url, fetched);
        summary.push({ page, mobile: result.mobile, desktop: result.desktop });

        const line =
          [
            url,
            result.mobile.scores.performance.score,
            result.mobile.scores.accessibility.score,
            result.mobile.scores.bestPractices.score,
            result.mobile.scores.seo.score,
            result.desktop.scores.performance.score,
            result.desktop.scores.accessibility.score,
            result.desktop.scores.bestPractices.score,
            result.desktop.scores.seo.score,
            path.relative(outDir, result.mobile.reportPath),
            path.relative(outDir, result.desktop.reportPath),
          ]
            .map(escapeCsv)
            .join(',') + '\n';
        fs.appendFileSync(csvPath, line);
        fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));

        process.stdout.write(
          `готово | mobile P:${result.mobile.scores.performance.score} A:${result.mobile.scores.accessibility.score} BP:${result.mobile.scores.bestPractices.score} SEO:${result.mobile.scores.seo.score} ` +
            `| desktop P:${result.desktop.scores.performance.score} A:${result.desktop.scores.accessibility.score} BP:${result.desktop.scores.bestPractices.score} SEO:${result.desktop.scores.seo.score}\n`,
        );
      } catch (err) {
        process.stdout.write(`ОШИБКА: ${err.message}\n`);
        summary.push({ url, error: err.message });
        fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));
      }
    }
  } finally {
    chrome.kill();
  }

  process.stdout.write(
    `\nГотово. Обработано страниц: ${pages.length}\nСводка с деталями: ${jsonPath}\nСводка (CSV): ${csvPath}\nHTML-отчёты: ${path.join(outDir, 'reports')}\n`,
  );
}

try {
  await main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
