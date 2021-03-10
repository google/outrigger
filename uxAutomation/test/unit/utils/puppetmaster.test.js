/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const puppeteer = require('puppeteer');
const assert = require('assert');
const {ActionType, PuppetMaster} = require('../../../utils/puppetmaster.js');

/* eslint-env jest */

let browser, page;

// Set timeout to 1 min.
jest.setTimeout(1000 * 60);

describe('PupptMaster unit test', () => {
  beforeEach(async () => {
  });

  it('runs flow with simple steps', async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();

    let pm = new PuppetMaster(page);
    let flow = {
      steps: [{
        actionType: ActionType.URL,
        url: 'https://thinkwithgoogle.com',
      }],
    }
    let flowResult = await pm.runFlow(flow);
    browser.close();
  });

  it('runs flow with styles snapshot and assert styles change', async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();

    let pm = new PuppetMaster(page);
    let flow = {
      steps: [{
        actionType: ActionType.URL,
        url: 'https://bootstrap-form-validation.glitch.me/',
      }, {
        actionType: ActionType.STYLE_SNAPSHOT,
        selector: 'form',
      }, {
        actionType: ActionType.CLICK,
        selector: 'button[type="submit"]',
        sleepAfter: 2000,
      }, {
        actionType: ActionType.ASSERT_STYLE_CHANGE,
        selector: 'form',
      }],
    }

    let flowResult = await pm.runFlow(flow);
    browser.close();
  });

  afterEach(() => {
    if (browser) browser.close();
  });
});
