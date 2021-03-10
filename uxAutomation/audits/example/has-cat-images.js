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

class CatAudit extends Audit {
  static get meta() {
    return {
      id: 'has-cat-images',
      title: 'Page has least one cat image',
      failureTitle: 'Page does not have at least one cat image',
      description:
        'Pages should have lots of cat images to keep users happy. ' +
        'Consider adding a picture of a cat to your page improve engagement.',
      requiredArtifacts: ['ImageElements'],
    };
  }

  static audit(artifacts) {
    // Artifacts requested in `requiredArtifacts` above are passed to your audit.
    // See the "API -> Plugin Audits" section below for what artifacts are available.
    const images = artifacts.ImageElements;
    const catImages = images.filter(image => image.src.toLowerCase().includes('cat'));

    return {
      // Give users a 100 if they had a cat image, 0 if they didn't.
      score: catImages.length > 0 ? 1 : 0,
      // Also return the total number of cat images that can be used by report JSON consumers.
      numericValue: catImages.length,
    };
  }
}

module.exports = CatAudit;
