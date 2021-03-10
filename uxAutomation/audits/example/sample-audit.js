/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
// Plugin example from https://github.com/GoogleChrome/lighthouse/blob/master/docs/plugins.md

const Audit = require('lighthouse').Audit;

class PuppeteerAudit extends Audit {
  static get meta() {
    return {
      id: 'sample-audit',
      title: 'Puppeteer audit example for form validatiion',
      failureTitle: 'Form styles didn\'t change when submitting with empty values',
      description: 'Form styles should change when submitting with empty values',
      requiredArtifacts: ['SampleGatherer'],
    };
  }

  static audit(artifacts) {
    // Artifacts requested in `requiredArtifacts` above are passed to your audit.
    // See the "API -> Plugin Audits" section below for what artifacts are available.
    const flowResult = artifacts.SampleGatherer.flowResult;
    console.log(`\n\n\n${JSON.stringify(artifacts, null, 2)}\n\n`);

    return {
      // Give users a 100 if they had a cat image, 0 if they didn't.
      score: flowResult.status === 'success' ? 1 : 0,
      // Also return the total number of cat images that can be used by report JSON consumers.
      // numericValue: catImages.length,
    };
  }
}

module.exports = PuppeteerAudit;
