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

/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} pubSubEvent The event payload.
 * @param {object} context The event metadata.
 */

// gcloud functions deploy uxAutomation --runtime nodejs10 --trigger-topic lhux
// --source uxAutomation --memory=1024MB
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const config = require('./ux-custom-config.js');
const {execute, publish} = require('outrigger-utils');
const TRIX_QUEUE = 'trix-queue';


async function uxAutomationAudit(url) {
  try {
    const browser = await puppeteer.launch();
    const pptr_port =
        (new URL(browser.wsEndpoint())).port;  // use utility function to get WS
                                               // port the browser is running on

    const result = await lighthouse(url, {port: pptr_port}, config);

    const response = {};

    response.homeLink = result.lhr.audits['has-link-to-home'].score;
    response.homeDesc = result.lhr.audits['has-link-to-home'].title;

    response.keyValidation = result.lhr.audits['keyboard-validation'].score;
    response.keyDesc = result.lhr.audits['keyboard-validation'].title;

    response.formValidation = result.lhr.audits['form-validation'].score;
    response.formValDesc = result.lhr.audits['form-validation'].title;

    response.tapTargets = result.lhr.audits['tap-targets'].score;
    response.tapTargetsDesc = result.lhr.audits['tap-targets'].title;

    response.fontSize = result.lhr.audits['font-size'].score;
    response.fontSizeDesc = result.lhr.audits['font-size'].title;

    response.label = result.lhr.audits['label'].score;
    response.labelDesc = result.lhr.audits['label'].title;

    response.colorContrast = result.lhr.audits['color-contrast'].score;
    response.colorContrastDesc = result.lhr.audits['color-contrast'].title;

    response.contentWidth = result.lhr.audits['content-width'].score;
    response.contentWidthDesc = result.lhr.audits['content-width'].title;

    response.autocomplete = result.lhr.audits['autocomplete'].score;
    response.autocompleteDesc = result.lhr.audits['autocomplete'].title;

    response.discernableText = result.lhr.audits['link-name'].score;
    response.discernableTextDesc = result.lhr.audits['link-name'].title;

    // `.lhr` is the Lighthouse Result as a JS object
    console.log('Report is done for', result.lhr.finalUrl);

    await browser.close();

    return response;
  } catch (err) {
    throw new Error(
        `Audit error occured while auditing ${url}: ${err.message}`);
  }
}

const defaultReturn = {
  result: 'UX Automation Test Failure'
};


exports.uxAutomation = async (message, context) => {
  let testResults =
      await execute(message, context, uxAutomationAudit, defaultReturn);
  await publish(testResults, TRIX_QUEUE);
  return;
};
