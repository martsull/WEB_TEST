import { load as loadHtml } from 'cheerio';

export const SKIP_EXT =
  /\.(pdf|jpe?g|png|gif|svg|webp|ico|css|js|mjs|zip|rar|7z|mp4|mp3|avi|mov|webm|wav|woff2?|ttf|eot|otf|xml|json|txt|csv|docx?|xlsx?|pptx?|rss|atom)(\?.*)?$/i;

export function normalizeUrl(rawUrl) {
  const u = new URL(rawUrl);
  u.hash = '';
  if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
    u.pathname = u.pathname.slice(0, -1);
  }
  return u.toString();
}

export function sanitizeFilename(url, index) {
  const u = new URL(url);
  let base = u.pathname === '/' ? 'index' : u.pathname.replace(/^\//, '').replace(/\//g, '_');
  if (u.search) base += '_' + u.search.replace(/[^a-z0-9]/gi, '_');
  base = base.replace(/[^a-z0-9_.-]/gi, '_').slice(0, 80);
  return `${String(index).padStart(4, '0')}_${base || 'page'}`;
}

export function scoreRating(score) {
  if (score === null || score === undefined) return null;
  if (score >= 90) return 'good';
  if (score >= 50) return 'needs_improvement';
  return 'poor';
}

export function extractScores(lhr) {
  const c = lhr.categories;
  const pct = (cat) => (c[cat] && c[cat].score !== null ? Math.round(c[cat].score * 100) : null);
  const withRating = (score) => ({ score, rating: scoreRating(score) });
  return {
    performance: withRating(pct('performance')),
    accessibility: withRating(pct('accessibility')),
    bestPractices: withRating(pct('best-practices')),
    seo: withRating(pct('seo')),
  };
}

export function escapeCsv(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const startedAt = Date.now();
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteLighthouseAudit/1.0)' },
    });
    clearTimeout(timeout);
    const responseTime = Date.now() - startedAt;
    const statusCode = res.status;
    const server = res.headers.get('server') || null;
    const cdn = detectCdn(res.headers);
    const finalUrl = res.url || url;
    const security = extractSecurityHeaders(res.headers, finalUrl);
    if (!res.ok) return { html: null, finalUrl, statusCode, responseTime, server, cdn, security };
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return { html: null, finalUrl, statusCode, responseTime, server, cdn, security };
    const html = await res.text();
    return { html, finalUrl, statusCode, responseTime, server, cdn, security };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

function detectCdn(headers) {
  if (headers.get('cf-ray') || /cloudflare/i.test(headers.get('server') || '')) return 'Cloudflare';
  if (headers.get('x-served-by') && /fastly/i.test(headers.get('x-served-by'))) return 'Fastly';
  if (headers.get('x-amz-cf-id')) return 'CloudFront';
  if (headers.get('x-cache') && /varnish/i.test(headers.get('via') || '')) return 'Varnish';
  return null;
}

function extractSecurityHeaders(headers, finalUrl) {
  return {
    https: finalUrl.startsWith('https://'),
    hsts: !!headers.get('strict-transport-security'),
    csp: !!headers.get('content-security-policy'),
    xframe: !!headers.get('x-frame-options'),
  };
}

export function extractSecurity(pageUrl, page) {
  if (page?.security) {
    const { https, hsts, csp, xframe } = page.security;
    return { https, headers: { hsts, csp, xframe } };
  }
  let https = null;
  try {
    https = new URL(pageUrl).protocol === 'https:';
  } catch {
    // invalid page URL; can't determine protocol
  }
  return { https, headers: { hsts: null, csp: null, xframe: null } };
}

export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return null;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${Math.round(bytes / 1e3)} KB`;
  return `${Math.round(bytes)} B`;
}

export function extractMetrics(lhr) {
  const a = lhr.audits;
  const num = (id) => (a[id] && typeof a[id].numericValue === 'number' ? Math.round(a[id].numericValue) : null);
  return {
    fcp: { value: num('first-contentful-paint'), unit: 'ms' },
    lcp: { value: num('largest-contentful-paint'), unit: 'ms' },
    cls: { value: a['cumulative-layout-shift'] ? Number(a['cumulative-layout-shift'].numericValue.toFixed(3)) : null },
    tbt: { value: num('total-blocking-time'), unit: 'ms' },
    si: { value: num('speed-index'), unit: 'ms' },
    tti: { value: num('interactive'), unit: 'ms' },
  };
}

const CWV_THRESHOLDS = {
  lcp: { good: 2500, needsImprovement: 4000 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  tbt: { good: 200, needsImprovement: 600 },
};

function cwvStatus(metric, value) {
  if (value === null || value === undefined) return null;
  const t = CWV_THRESHOLDS[metric];
  if (value <= t.good) return 'good';
  if (value <= t.needsImprovement) return 'needs_improvement';
  return 'poor';
}

// Lab runs can't measure real INP (needs field interaction data), so TBT stands in as the closest lab proxy.
export function extractCoreWebVitals(metrics) {
  return {
    lcp: { value: metrics.lcp.value, unit: 'ms', status: cwvStatus('lcp', metrics.lcp.value) },
    cls: { value: metrics.cls.value, status: cwvStatus('cls', metrics.cls.value) },
    fcp: { value: metrics.fcp.value, unit: 'ms', status: cwvStatus('fcp', metrics.fcp.value) },
    tbt: { value: metrics.tbt.value, unit: 'ms', status: cwvStatus('tbt', metrics.tbt.value), note: 'lab proxy for INP' },
  };
}

const RESOURCE_CATEGORY_MAP = {
  Script: 'javascript',
  Stylesheet: 'css',
  Image: 'images',
  Font: 'fonts',
};

export function extractPageWeight(lhr) {
  const items = lhr.audits['network-requests']?.details?.items || [];
  const totalBytes = lhr.audits['total-byte-weight']?.numericValue ?? items.reduce((sum, i) => sum + (i.transferSize || 0), 0);

  const buckets = {
    javascript: { bytes: 0, count: 0 },
    css: { bytes: 0, count: 0 },
    images: { bytes: 0, count: 0 },
    fonts: { bytes: 0, count: 0 },
    other: { bytes: 0, count: 0 },
  };
  for (const item of items) {
    const key = RESOURCE_CATEGORY_MAP[item.resourceType] || 'other';
    buckets[key].bytes += item.transferSize || 0;
    buckets[key].count += 1;
  }

  return {
    totalSize: formatBytes(totalBytes),
    requests: items.length,
    resources: {
      javascript: { size: formatBytes(buckets.javascript.bytes), count: buckets.javascript.count },
      css: { size: formatBytes(buckets.css.bytes), count: buckets.css.count },
      images: { size: formatBytes(buckets.images.bytes), count: buckets.images.count },
      fonts: { size: formatBytes(buckets.fonts.bytes), count: buckets.fonts.count },
      other: { size: formatBytes(buckets.other.bytes), count: buckets.other.count },
    },
  };
}

export function extractNetwork(lhr, pageUrl) {
  const items = lhr.audits['network-requests']?.details?.items || [];
  let origin = null;
  try {
    origin = new URL(pageUrl).origin;
  } catch {
    // invalid page URL; can't determine first vs third party
  }

  let thirdPartyRequests = 0;
  for (const item of items) {
    try {
      if (origin && new URL(item.url).origin !== origin) thirdPartyRequests += 1;
    } catch {
      // non-http(s) URL (data:, blob:); not counted as third-party
    }
  }

  const largestResources = [...items]
    .filter((i) => i.transferSize)
    .sort((a, b) => b.transferSize - a.transferSize)
    .slice(0, 5)
    .map((i) => ({
      url: i.url,
      type: RESOURCE_CATEGORY_MAP[i.resourceType] || (i.resourceType || 'other').toLowerCase(),
      size: formatBytes(i.transferSize),
    }));

  return { totalRequests: items.length, thirdPartyRequests, largestResources };
}

const LARGE_IMAGE_BYTES = 100 * 1000;

export function extractImageNetworkStats(lhr) {
  const items = lhr.audits['network-requests']?.details?.items || [];
  const largeImages = items.filter((i) => i.resourceType === 'Image' && (i.transferSize || 0) > LARGE_IMAGE_BYTES).length;
  const notOptimized = lhr.audits['modern-image-formats']?.details?.items?.length || 0;
  return { largeImages, notOptimized };
}

const ISSUE_RECOMMENDATIONS = {
  'render-blocking-resources': 'Defer or inline critical CSS/JS so the browser can paint before all blocking resources load.',
  'uses-responsive-images': 'Serve images sized for the display area instead of the original upload dimensions.',
  'unminified-javascript': 'Minify JavaScript bundles during the build step.',
  'unused-css-rules': 'Split or purge CSS so pages only load styles they actually use.',
  'unused-javascript': 'Code-split bundles and lazy-load JS that isn\'t needed for the initial view.',
  'modern-image-formats': 'Convert JPEG/PNG images to WebP or AVIF.',
  'legacy-javascript': 'Drop unnecessary polyfills/transforms for browsers that don\'t need them.',
  'offscreen-images': 'Lazy-load images that are below the fold.',
  redirects: 'Point links directly at the final URL to remove redirect hops.',
  'prioritize-lcp-image': 'Preload the LCP image so it starts fetching immediately.',
};

function issueSeverity(score) {
  if (score === 0) return 'high';
  if (score < 0.5) return 'medium';
  return 'low';
}

export function extractPerformanceIssues(lhr) {
  const refs = lhr.categories.performance?.auditRefs || [];
  const issues = [];
  for (const ref of refs) {
    const audit = lhr.audits[ref.id];
    if (!audit || audit.details?.type !== 'opportunity') continue;
    if (audit.score === null || audit.score >= 1) continue;
    const bytes = audit.details.overallSavingsBytes;
    const ms = audit.details.overallSavingsMs;
    let savings = null;
    if (bytes) savings = formatBytes(bytes);
    else if (ms) savings = `${Math.round(ms)} ms`;
    issues.push({
      id: audit.id,
      category: 'performance',
      severity: issueSeverity(audit.score),
      title: audit.title,
      score: audit.score,
      impact: savings,
      recommendation: ISSUE_RECOMMENDATIONS[audit.id] || null,
    });
  }
  return issues.sort((a, b) => a.score - b.score);
}

export function extractDiagnostics(lhr) {
  const refs = lhr.categories.performance?.auditRefs || [];
  const diagnostics = [];
  for (const ref of refs) {
    if (ref.group !== 'diagnostics') continue;
    const audit = lhr.audits[ref.id];
    if (!audit || audit.details?.type === 'opportunity') continue;
    if (!audit.displayValue || audit.score === 1) continue;
    diagnostics.push({ title: audit.title, details: audit.displayValue });
  }
  return diagnostics;
}

export function extractAccessibilityIssues(lhr) {
  const refs = lhr.categories.accessibility?.auditRefs || [];
  const issues = [];
  for (const ref of refs) {
    const audit = lhr.audits[ref.id];
    if (!audit || audit.score === null || audit.score >= 1) continue;
    const count = Array.isArray(audit.details?.items) ? audit.details.items.length : 0;
    if (!count) continue;
    issues.push({ id: audit.id, count });
  }
  return issues.sort((a, b) => b.count - a.count);
}

function jsonLdTypes($) {
  const types = new Set();
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).contents().text());
      for (const entry of Array.isArray(data) ? data : [data]) {
        const t = entry?.['@type'];
        if (!t) continue;
        for (const one of Array.isArray(t) ? t : [t]) types.add(one);
      }
    } catch {
      // malformed JSON-LD block; skip it
    }
  });
  return [...types];
}

const TITLE_LENGTH = { min: 30, max: 60 };
const DESCRIPTION_LENGTH = { min: 120, max: 160 };

function lengthStatus(exists, length, bounds) {
  if (!exists) return 'missing';
  if (length < bounds.min) return 'too_short';
  if (length > bounds.max) return 'too_long';
  return 'ok';
}

export function extractSeoChecks(lhr, html) {
  const a = lhr.audits;
  if (!html) {
    return {
      title: { exists: null, length: null, text: null, status: null },
      description: { exists: null, length: null, text: null, status: null },
      h1: { count: null, text: null },
      canonical: { exists: false },
      robots: { index: a['is-crawlable'] ? a['is-crawlable'].score === 1 : null, noindex: null },
      schema: { exists: false, types: [] },
    };
  }
  const $ = loadHtml(html);
  const titleText = $('title').first().text().trim() || null;
  const descriptionText = $('meta[name="description"]').attr('content')?.trim() || null;
  const h1Els = $('h1');
  const schemaTypes = jsonLdTypes($);
  const hasMicrodata = $('[itemscope]').length > 0;
  const index = a['is-crawlable'] ? a['is-crawlable'].score === 1 : null;
  const titleLength = titleText ? titleText.length : 0;
  const descriptionLength = descriptionText ? descriptionText.length : 0;

  return {
    title: {
      exists: !!titleText,
      length: titleLength,
      text: titleText,
      status: lengthStatus(!!titleText, titleLength, TITLE_LENGTH),
    },
    description: {
      exists: !!descriptionText,
      length: descriptionLength,
      text: descriptionText,
      status: lengthStatus(!!descriptionText, descriptionLength, DESCRIPTION_LENGTH),
    },
    h1: { count: h1Els.length, text: h1Els.first().text().trim() || null },
    canonical: { exists: a['canonical'] ? a['canonical'].score === 1 : $('link[rel="canonical"]').length > 0 },
    robots: { index, noindex: index === null ? null : !index },
    schema: { exists: schemaTypes.length > 0 || hasMicrodata, types: schemaTypes },
  };
}

export function extractContent(html, pageUrl) {
  if (!html) {
    return {
      wordCount: null,
      headings: { h1: null, h2: null, h3: null },
      images: { total: null, withoutAlt: null, missingWidthHeight: null, formats: null },
      links: { internal: null, external: null },
    };
  }
  const $ = loadHtml(html);
  $('script, style, noscript').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = text ? text.split(' ').length : 0;

  const images = $('img');
  const withoutAlt = images.filter((_, el) => !$(el).attr('alt')?.trim()).length;
  const missingWidthHeight = images.filter((_, el) => !$(el).attr('width') || !$(el).attr('height')).length;
  const formats = {};
  images.each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const match = src.match(/\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i);
    const ext = match ? match[1].toLowerCase().replace('jpeg', 'jpg') : 'unknown';
    formats[ext] = (formats[ext] || 0) + 1;
  });

  let origin = null;
  try {
    origin = new URL(pageUrl).origin;
  } catch {
    // invalid page URL; treat all links as external
  }
  let internal = 0;
  let external = 0;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    try {
      const abs = new URL(href, pageUrl);
      if (origin && abs.origin === origin) internal += 1;
      else external += 1;
    } catch {
      // unparsable href; ignore
    }
  });

  return {
    wordCount,
    headings: { h1: $('h1').length, h2: $('h2').length, h3: $('h3').length },
    images: { total: images.length, withoutAlt, missingWidthHeight, formats },
    links: { internal, external },
  };
}

const ANALYTICS_SIGNATURES = {
  'Google Analytics': /gtag\(|googletagmanager\.com\/gtag|google-analytics\.com\/analytics\.js/i,
  'Google Tag Manager': /googletagmanager\.com\/gtm\.js/i,
  'Yandex Metrika': /mc\.yandex\.(ru|by|com)\/(metrika\/tag\.js|watch\/)/i,
  'Facebook Pixel': /connect\.facebook\.net\/.*\/fbevents\.js/i,
};

function detectAnalytics(html) {
  const found = [];
  for (const [name, re] of Object.entries(ANALYTICS_SIGNATURES)) {
    if (re.test(html)) found.push(name);
  }
  return found;
}

export function detectTechnology(html, { server, cdn } = {}) {
  if (!html) return { framework: 'unknown', cms: 'unknown', analytics: [], server: server ?? null, cdn: cdn ?? null };
  const $ = loadHtml(html);
  const generator = $('meta[name="generator"]').attr('content');

  let cms = 'unknown';
  if (generator) cms = generator;
  else if (/\/bitrix\//i.test(html)) cms = '1C-Bitrix';
  else if (/wp-content|wp-includes/i.test(html)) cms = 'WordPress';
  else if (/Drupal\.settings/i.test(html)) cms = 'Drupal';
  else if (/Joomla!/i.test(html)) cms = 'Joomla';

  let framework = 'unknown';
  if (/__NEXT_DATA__/.test(html)) framework = 'Next.js';
  else if (/__NUXT__/.test(html)) framework = 'Nuxt';
  else if (/\bng-version=/.test(html)) framework = 'Angular';
  else if (/data-reactroot|__REACT_DEVTOOLS_GLOBAL_HOOK__/.test(html)) framework = 'React';
  else if (/data-v-[0-9a-f]{6,8}|window\.Vue\b/.test(html)) framework = 'Vue';

  return { framework, cms, analytics: detectAnalytics(html), server: server ?? null, cdn: cdn ?? null };
}

export function buildDetailReport({ url, device, lhr, html, page }) {
  const metrics = extractMetrics(lhr);
  const content = extractContent(html, url);
  content.images = { ...content.images, ...extractImageNetworkStats(lhr) };
  return {
    url,
    device,
    scores: extractScores(lhr),
    metrics,
    coreWebVitals: extractCoreWebVitals(metrics),
    pageWeight: extractPageWeight(lhr),
    network: extractNetwork(lhr, url),
    issues: extractPerformanceIssues(lhr),
    diagnostics: extractDiagnostics(lhr),
    seo: extractSeoChecks(lhr, html),
    content,
    accessibilityIssues: extractAccessibilityIssues(lhr),
    technology: detectTechnology(html, page || {}),
    security: extractSecurity(url, page),
  };
}

export function buildPageInfo(url, fetched) {
  let pathname = url;
  try {
    pathname = new URL(url).pathname;
  } catch {
    // leave pathname as the raw url if it doesn't parse
  }
  return {
    url,
    path: pathname,
    crawlDate: new Date().toISOString(),
    statusCode: fetched?.statusCode ?? null,
    responseTime: fetched?.responseTime ?? null,
  };
}
