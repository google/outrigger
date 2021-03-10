/**
 * @license
 * Copyright 2019 Google Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Gatherer = require('lighthouse').Gatherer;

/**
 * This class implements a lighthouse gatherer to create an artifact containing
 * the completed DOM of the document being audited.
 */
class CompletedDOM extends Gatherer {
  /**
   * Overridden method from Gatherer that runs at the end of the audit.
   * @param {*} options Options passed by lighthouse.
   * @return {string} The body of the document being audited.
   */
  afterPass(options) {
    const driver = options.driver;
    return driver.evaluateAsync('document.body.outerHTML')
        .then((docBody) => {
          if (!docBody || (typeof docBody !== 'string')) {
            throw new Error('Unable to retrieve document body');
          }
          return docBody;
        });
  }
}

module.exports = CompletedDOM;
