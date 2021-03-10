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

const {ActionType} = require('../utils/puppetmaster');
const PuppeteerGatherer = require('./puppeteer-gatherer');

let taskFlow = {
  steps: [{
    actionType: ActionType.SCROLL_TO,
    selector: 'form button[type="submit"]',
  }, {
    // Take a snapshot of all styles in the <form> element.
    actionType: ActionType.STYLE_SNAPSHOT,
    selector: 'form',
  }, {
    actionType: ActionType.CLICK,
    selector: 'button[type="submit"]',
    sleepAfter: 2000,
  }, {
    // Assert any style changes within the <form> element.
    actionType: ActionType.ASSERT_STYLE_CHANGE,
    selector: 'form',
  }],
};

/**
 * This class implements a lighthouse gatherer to create an artifact containing
 * the completed DOM of the document being audited.
 */
class SampleGatherer extends PuppeteerGatherer {
  /**
   * Overridden method from Gatherer that runs at the end of the audit.
   * @param {*} options Options passed by lighthouse.
   * @return {string} The body of the document being audited.
   */
  async afterPass(options) {
    options.taskFlow = taskFlow;
    let flowResult = await super.runFlow(options);
    return {flowResult};
  }
}

module.exports = SampleGatherer;
