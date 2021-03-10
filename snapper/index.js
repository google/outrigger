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
 * @fileoverview Description of this file.
 */

// gcloud functions deploy snapper --runtime nodejs10 --trigger-topic snap --source snapper --env-vars-file env.yaml
const puppeteer = require('puppeteer');
const {execute, publish, writeToBucket} = require("outrigger-utils");
const NETWORK_EVENT = "networkidle2";
const PHONE_MODEL = "Pixel 2 XL";
/**
 * Take a picture of the URL and save the screenshot to a Cloud Storage Bucket
 * @param {string} url Test url
 * @return {!Object<string, string>} Snap test result.
 */
async function snap(url, args) {
  const buffer = await takeScreenshot(url, args);
  const filename = `${url.slice(8)}_${Date.now().toString()}.png`;
  let screenshotUrl;

  try {
    screenshotUrl = await writeToBucket(filename, buffer);
  }
  catch (err) {
    throw new Error(`Screenshot error occurred while saving snapshot to bucket: ${url}`);
  }

  return {screenshotUrl};
}

/**
 * Emulate a mobile browser using Puppeteer and take a snapshot.
 * @param {string} url Test page url
 * @param {Object<String, String>} args Contains optional arguments for tests 
 * @return {*} Image buffer
 */
async function takeScreenshot(url, args) {

    const phoneModel = puppeteer.devices[PHONE_MODEL];

    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.emulate(phoneModel);
    await page.goto(url, {waitUntil: NETWORK_EVENT});

    let buffer;

    if ("fullPage" in args) {
      let fullPage = args["fullPage"].toLowerCase() === "true" ? true : false;
      buffer = await page.screenshot({fullPage: fullPage});
    } else {
      buffer = await page.screenshot();
    }

    await page.close();
    await browser.close();

    return buffer;
}

const defaultReturn = {result: 'Snapper Test Failure'};

/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {!object} message The Pub/Sub message.
 * @param {!object} context The event metadata.
 */
exports.snapper = async (message, context) => {
  let testResults = await execute(message, context, snap, defaultReturn);
  await publish(testResults, process.env.TRIX_QUEUE);
  await publish(testResults, process.env.SQL_QUEUE);
  return;
};
