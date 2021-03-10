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

// import required modules for lighthouse and puppeteer
const pptr = require('puppeteer');
const lh = require('lighthouse');
const LighthouseResult = require('./LighthouseResult'); // import custom result class

// this is a utility function to use a RegEx and pull port# out of a websocket address (for puppeteer)
function getPort(browser) {
  return parseInt(/(?<=:)\d{1,5}(?=\/)/.exec(browser.wsEndpoint())[0]);
}

// this async function runs an audit on a single page

class Auditor {
  constructor() {
    this.lighthouseMap = { Date: () => new Date().toUTCString() }; // date is the only default map function
    this.customTests = [];
  }

  addCustomTest(test) {
    // this function adds a custom puppeteer test
    // the test function takes two arguments (page, result) which are the puppeteer page to manipulate/test, and the final lighthouseresult to write results to
    this.customTests.push(test);
  }

  addCustomMap(map) {
    // add the new props from the custom map onto the existing lighthouse map
    this.lighthouseMap = { ...this.lighthouseMap, ...map };
  }

  async auditPage(URL) {
    try {
      // use a regex to make sure the URL is valid (starts with "http://" or "https://")
      // note that we should really update this to be more robust
      if (!/https?:\/\/.*/.test(URL)) {
        throw new Error('Not a valid URL');
      }

      const res = new LighthouseResult(URL);

      // launch a puppeteer browser
      const browser = await pptr.launch();
      const port = getPort(browser); // use utility function to get WS port the browser is running on

      // run lighthouse audit and pull the result out of the returned object
      const flags = {
        port,
      };
      const { lhr } = await lh(URL, flags, null);

      res.setLighthouseResult(lhr, this.lighthouseMap);

      await Promise.all(
        this.customTests.map(async (test) => {
          const page = await browser.newPage();
          await page.goto(URL);
          await test(page, res);
          await page.close();
        }),
      );

      // at this point, we can implement middleware (iterate through the middleware stack)
      // TO BE IMPLEMENTED

      // once that's done, we can close the browser and return the result
      await browser.close();

      return res; // generate new lighthouse result and return the object
    } catch (err) {
      console.error(`Error while auditing ${URL}`);
      console.error(err);
      return new LighthouseResult(URL).setErr(err.message);
    }
  }

  // this function audits a bunch of pages by calling the function above
  async auditPages(URLs) {
    // note: we can't run these audits in parallel because of a problem with the lighthouse module
    const results = [];

    // go through each URL, audit it, and add to results
    for (let i = 0; i < URLs.length; i++) {
      results.push(await auditPage(URLs[i]));
      console.log(`Finished audit #${i + 1}: ${URLs[i]}`);
    }

    return results;
  }
}

// finally expose these functions to the module
module.exports = Auditor;