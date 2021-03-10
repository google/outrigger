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
const Audit = require('lighthouse').Audit;
const {parseDocument} = require('../common/parse-document');
const {extractProtocol, extractDomain} = require('../common/extract-domain');

class HasLinkToHomeAudit extends Audit {
  static get meta() {
    let learnMoreURL = 'https://developers.google.com/web/fundamentals/design-and-ux/principles';
    return {
      id: 'has-link-to-home',
      title: 'The page has a link back to the home page',
      failureTitle: 'This page doesn\'t have a link navigating back to the home page',
      description: `Add an anchor link that navigates back to the home page. E.g. "/" root path or to the domain. [Learn more](${learnMoreURL})`,
      requiredArtifacts: ['URL', 'CompletedDOM'],
    };
  }

  /**
   * Check if there is a link to the homepage. At the moment, the homepage must
   * be one of /, domain.tld, domain.tld/, index.html, /index.html or
   * domain.tld/index.html
   */
  static audit(artifacts) {
    const url = artifacts.URL.finalUrl || artifacts.URL.requestedUrl;
    const protocol = extractProtocol(url);
    const domain = extractDomain(url);
    const document = parseDocument(artifacts.CompletedDOM);

    let numAnchors = 0;
    const patterns = [
      '/',
      `index.html`,
      `/index.html`,
      `${protocol}://${domain}`,
      `${protocol}://${domain}/`,
      `${protocol}://${domain}/index.html`,
    ];
    patterns.forEach(pattern => {
      const anchors = document.querySelectorAll(`a[href="${pattern}"]`);
      // Consider URLs having query parameters
      const anchorsWithParams = document.querySelectorAll(`a[href^="${pattern}?"]`);
      numAnchors += anchors.length + anchorsWithParams.length;
    });

    return {
      score: numAnchors >= 1 ? 1 : 0,
      numericValue: numAnchors,
    };
  }
}

module.exports = HasLinkToHomeAudit;
