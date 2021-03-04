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
 * @fileoverview The script will open a URL in Chrome and audit
 * low contrast issues using the CDP's Audits.checkContrast method.
 */
const puppeteer = require('puppeteer');
const {execute, publish, writeToBucket} = require("outrigger-utils");

/**
 * @param {string} url
 * @returns {!Object}
 */
async function getContrast(url) {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();

    await page.goto(url);

    const client = await page.target().createCDPSession();

    await client.send('Audits.enable');

    const issues = [];

    client.on('Audits.issueAdded', ({issue}) => issue.code === 'LowTextContrastIssue' && issues.push(issue));

    await client.send('Audits.checkContrast');

    return {
      AA: issues
        .filter(issue => issue.details.lowTextContrastIssueDetails.contrastRatio < issue.details.lowTextContrastIssueDetails.thresholdAA)
        .length,
      AAA: issues
        .filter(issue => issue.details.lowTextContrastIssueDetails.contrastRatio >= issue.details.lowTextContrastIssueDetails.thresholdAA)
        .length
    };
  } finally {
    await browser.close();
  }
}

const defaultReturn = {result: 'CDP Low Contrast Issues Test Failure'};

/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {!object} message The Pub/Sub message.
 * @param {!object} context The event metadata.
 */
exports.cdpLowContrastIssues = async (message, context) => {
  let testResults = await execute(message, context, getContrast, defaultReturn);
  await publish(testResults, process.env.TRIX_QUEUE);
  await publish(testResults, process.env.SQL_QUEUE);
  return;
};
exports.getContrast = getContrast;
