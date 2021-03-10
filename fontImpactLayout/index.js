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
 * @fileoverview The script will open chrome once with web fonts disabled, and
 * once with webfonts enabled. It will then load the URLs, and calculate CLS,
 * cls diff, and screenshots. Goal is to see how much impact web fonts have on
 *  CLS.
 * Based off of
 * https://gist.github.com/martinschierle/1d412cf1b8bc76e726e8c9ceddca1071
 */
// gcloud functions deploy fontImpactLayout --runtime nodejs10 --trigger-topic fil --source fontImpactLayout --env-vars-file env.yaml
const puppeteer = require('puppeteer');
const {execute, publish, writeToBucket} = require("outrigger-utils");
const mergeImg = require('merge-img');
const Jimp = require('jimp');
const { promisify } = require('util');
const GOOD_3_G = {
  'offline': false,
  'downloadThroughput': 1.5 * 1024 * 1024 / 8,
  'uploadThroughput': 750 * 1024 / 8,
  'latency': 40
};

const PHONE = puppeteer.devices['Nexus 5X'];
function injectJs() {
  window.cls = 0;
  let po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
    window.cls += entry.value;
      }
    });
    po.observe({type: 'layout-shift', buffered: true});
}
async function getBrowser(allowWebFonts) {
  let args = ['--no-sandbox'];
  if(!allowWebFonts) {
    args.push("--disable-remote-fonts");
  }
  const browser = await puppeteer.launch({
    args: args,
    //headless: false,
  //executablePath: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    timeout: 10000
  });
  return browser;
}
async function getNewPage(browser) {
  const page = await browser.newPage();
  await page.emulate(PHONE);
  await page.setCacheEnabled(false); // no cache, so that we can reuse the same page several times
  return page;
}

async function getCLS(page, url) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000});
  await page.waitFor(1000); // let's give it a bit more time, to be sure everything's loaded
  console.log("Injecting JS...");
  await Promise.race([
    page.evaluate(injectJs),
    page.waitFor(5000)
  ]);
  page.waitFor(2000);
  console.log("Gathering data...");
  let cls = await Promise.race([
    page.evaluate(function() {return window.cls;}),
    page.waitFor(5000)
  ]);
  return cls;
}

async function fil(url, args) {
  let withFontBrowser = await getBrowser(true);
  let withFontPage = await getNewPage(withFontBrowser);
  let withFontCLS = (
      await getCLS(withFontPage, url) + await getCLS(withFontPage, url)
      ) / 2;  // two runs to average things out
  await withFontPage.screenshot({path: '/tmp/withfonts.png'});
  await withFontBrowser.close();
  let noFontsBrowser = await getBrowser(false);
  let noFontsPage = await getNewPage(noFontsBrowser);
  let noFontCLS = (
      await getCLS(noFontsPage, url) + await getCLS(noFontsPage, url)
      ) / 2; // two runs to average things out
  await noFontsPage.screenshot({path: '/tmp/nofonts.png'});
  await noFontsBrowser.close();
  let screenshotName = `${url.slice(8)}_${Date.now().toString()}-fil.png`;
  let img = await mergeImg([
    '/tmp/withfonts.png',
    '/tmp/nofonts.png'
  ]);
  
  let screenshotUrl;
  const asyncGetBuffer = promisify(img.getBuffer).bind(img);
  try {
    var buffer = await asyncGetBuffer(Jimp.MIME_PNG);
    screenshotUrl = await writeToBucket(screenshotName, buffer);
    return {screenshotUrl, noFontCLS, withFontCLS};
  } catch (err) {
    console.log(err);
    throw new Error(`Screenshot error occurred while saving fil snapshop to bucket: ${url}`);
  }
}

const defaultReturn = {result: 'Font Impact Layout Test Failure'};

/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {!object} message The Pub/Sub message.
 * @param {!object} context The event metadata.
 */
exports.fontImpactLayout = async (message, context) => {
  let testResults = await execute(message, context, fil, defaultReturn);
  await publish(testResults, process.env.TRIX_QUEUE);
  await publish(testResults, process.env.SQL_QUEUE);
  return;
};
