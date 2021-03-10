/**
 * @license Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Gatherer = require('lighthouse').Gatherer;
const Puppeteer = require('puppeteer');
const {PuppetMaster, ActionType} = require('../utils/puppetmaster');

/**
 * Connector for retrieving puppeteer browser and page objects.
 * @param  {object} driver
 * @return {object, object} browser, page
 */
async function connect(driver) {
  const browser = await Puppeteer.connect({
    browserWSEndpoint: await driver.wsEndpoint(),
    defaultViewport: null,
  });
  const {targetInfo} = await driver.sendCommand('Target.getTargetInfo');
  const puppeteerTarget = (await browser.targets())
    .find(target => target._targetId === targetInfo.targetId);

  const page = await puppeteerTarget.page();
  return {browser, page};
}

/**
 * Base PuppeteerGatherer class.
 */
class PuppeteerGatherer extends Gatherer {
  /**
   * Run task flow with PuppetMaster.
   * @param {object} options
   *     options.taskFlow {object} The task flow object.
   * @return {object} flow result object.
   */
  async runFlow(options) {
    const {driver} = options;
    const {browser, page} = await connect(driver);
    return await new PuppetMaster(page).runFlow(options.taskFlow);
  }
}

module.exports = PuppeteerGatherer;
