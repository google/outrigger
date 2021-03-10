/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Auditor = require('./pptrLighthouseAuditor');

const auditor = new Auditor(); // this is the auditor that eventually gets exported

// add custom accessibility score/best practices score to a custom map
auditor.addCustomMap({
  'Accessibility Score': (lhr) =>
    Math.round(100 * lhr.categories.accessibility.score),
  'Best Practices': (lhr) =>
    Math.round(100 * lhr.categories['best-practices'].score),
  'SEO': (lhr) =>
    Math.round(100 * lhr.categories.seo.score),
});


// add extra performance-based metrics to custom map
auditor.addCustomMap({
  'TTI': (lhr) =>
    parseFloat((lhr.audits.interactive.numericValue / 1000).toFixed(2)),
  'TBT': (lhr) =>
    parseFloat(
      (lhr.audits['total-blocking-time'].numericValue / 1000).toFixed(2),
    ),
  'Speed Index': (lhr) =>
    parseFloat((lhr.audits['speed-index'].numericValue / 1000).toFixed(2)),
  'FCP': (lhr) =>
    parseFloat(
      (lhr.audits['first-contentful-paint'].numericValue / 1000).toFixed(2),
    ),
  'LCP': (lhr) =>
    parseFloat(
      (lhr.audits['largest-contentful-paint'].numericValue / 1000).toFixed(2),
    ),
  'CLS': (lhr) => lhr.audits['cumulative-layout-shift'].numericValue,
  'Performance Score': (lhr) =>
    Math.round(100 * lhr.categories.performance.score),
  'PWA Score': (lhr) => Math.round(100 * lhr.categories.pwa.score),
  'ServiceWorker': (lhr) => !!lhr.audits['service-worker'].score,
  'Page Weight': (lhr) => lhr.audits['total-byte-weight'].numericValue,
  'Renderblocking Time': (lhr) =>
    lhr.audits['render-blocking-resources'].numericValue,
  'Server Response Time': (lhr) =>
    lhr.audits['server-response-time'].numericValue,
  // 'installableManifest': (lhr) => !!lhr.audits['installable-manifest'].score,
  // 'isOnHttps': (lhr) => !!lhr.audits['is-on-https'].score,
});

// this "map" just tells you if an audit completed successfully
// I'm using pageweight as a proxy for success, because it must be a real number to prove that the audit ran at all
auditor.addCustomMap({
  'Audit Status': (lhr) => !!lhr.audits['total-byte-weight'].numericValue,
});

auditor.addCustomTest(async (page, res) => {
  const imgs = await page.$$('img');

  res.setCustomResult('Number of Images', imgs.length);
});

// add custom map to export accessibility recs as a JSON-compatible array of strings
// auditor.addCustomMap({
//   accessibilityRecs: (lhr) => {
//     const auditIds = lhr.categories.accessibility.auditRefs.map(
//       (ref) => ref.id,
//     );

//     const results = auditIds
//       .map((id) => lhr.audits[id])
//       .filter((audit) => audit.score === 0)
//       .map((audit) => audit.title)
//       .map((audit) => audit.split(`"`).join(`'`));

//     return `[${results.map((res) => `"${res}"`).join(', ')}]`;
//   },
// });

module.exports = auditor;
