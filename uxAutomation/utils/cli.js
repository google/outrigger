/* @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const lineReader = require('line-reader');
const exec = require('await-exec');
const fse = require('fs-extra');
const path = require('path');
const colors = require('colors');

class AutoUX {
  printUsage() {
    let usage = `
  Usage: ./autoux [URL] [OPTIONS...]

  Options (*denotes default value if not passed in):
    urls\t\tThe JSON file with the URL list for audit.
    output\t\tThe output folder path.
    compare\t\tThe JSON file with the URL list for audit.
    verbose\t\tPrint out verbose logs.

  Examples:
    # List CLI options
    ./autoux --help

    # Run UX audits for a specific URL.
    ./autoux https://google.com --output=output/

    # Run UX audits for a list of URLs with the given JSON
    ./autoux --urls=examples/sample-urls.txt --output=output/

    # Run UX audits for a list of URLs with comparison with predefined scores.
    ./autoux --urls=examples/sample-urls.txt --output=output/ --compare=examples/compares.json
    `;
    console.log(usage);
  }
  formatDate(date) {
    let s = new Date(date).toISOString();
    return s.slice(0,10) + ' ' + s.slice(11, 19);
  }
  getListFromFile(filename) {
    let text = fse.readFileSync(path.resolve(filename), 'utf8');
    return text.split('\n');
  }
  getJsonFromFile(filename) {
    return JSON.parse(fse.readFileSync(path.resolve(filename)));
  }

  async runSingleUrl(url, outputFolder, options) {
    let errors = [], summary;
    console.log(`Running audit for ${url}...`.yellow);

    try {
      // Run UX automation audit.
      let resultFilePath = await this.runAudit(url, outputFolder);

      // Get result.
      let json = this.getJsonFromFile(resultFilePath);
      summary = this.summarize([json]);

    } catch (e) {
      errors.push(e);
    }

    return {
      status: `Completed audit with 1 URL: ${url}`,
      summary: summary,
      errors: errors,
    }
  }

  async runUrlList(urlListFile, outputFolder, options) {
    let errors = [], urlCount = 0, results = [];
    console.log(`Multiple urls from ${urlListFile}...`.yellow);

    let urls = this.getListFromFile(urlListFile);
    for (let i=0; i<urls.length; i++) {
      let url = urls[i];
      try {
        if (!url) continue;
        console.log(`Running audit for ${url}...`.yellow);

        // Run UX automation audit.
        let resultFilePath = await this.runAudit(url, outputFolder);

        // Collect result and put into a summary.
        results.push(this.getJsonFromFile(resultFilePath));

        console.log(`results.length = ${results.length}`);

        urlCount += 1;

      } catch (e) {
        errors.push(e);
      }
    }

    let comparedResults;
    if (options.compare) {
      comparedResults = this.getJsonFromFile(options.compare);
      Object.keys(comparedResults).forEach(url => {
        comparedResults[url.replace(/\/$/, '')] = comparedResults[url];
      });
    }

    let summary = this.summarize(results, comparedResults);

    return {
      status: `Completed audits with ${urlCount} URLs`,
      summary: summary,
      errors: errors,
    }
  }

  async runAudit(url, outputFolder, options) {
    // Run UX automation audit.
    let escapedUrl = encodeURIComponent(url.replace(/\/$/, ''));
    let resultFilePath =
        `./${outputFolder}/lighthouse-result-[${escapedUrl}].json`;
    let command = `lighthouse --config-path=ux-custom-config.js ${url} ` +
        `--output=json --chrome-flags="--headless" ` +
        `--output-path="${resultFilePath}"`;
    await exec(command);

    return resultFilePath;
  }

  summarize(results, comparedResults) {
    let summary = {
      byUrls: {},
      byAudits: {},
    };
    let errors = [], allDeltas = {};

    // console.log('results...');
    // console.log(JSON.stringify(results, null, 2));
    // console.log('\n\ncomparedResults...');
    // console.log(JSON.stringify(comparedResults, null, 2));

    results.forEach(result => {
      try {
        let url = result.requestedUrl.replace(/\/$/, '');
        let overallScore = result.categories.ux.score;
        let scores = {}, scoreDeltas = {};
        let comparedResult = comparedResults ? comparedResults[url] : null;

        if (comparedResult) summary.deltas = summary.deltas || {};

        Object.keys(result.audits).forEach(auditName => {
          let score = result.audits[auditName].score;
          summary.byAudits[auditName] = summary.byAudits[auditName] || [];
          summary.byAudits[auditName].push(score);

          scores[auditName] = score;
          if (comparedResult && comparedResult.scores[auditName]) {
            scoreDeltas[auditName] =
                (score - comparedResult.scores[auditName]) / comparedResult.scores[auditName];
            summary.deltas[auditName] = summary.deltas[auditName] || [];
            summary.deltas[auditName].push(scoreDeltas[auditName]);
          }
        });

        let summaryByUrl = {
          overallScore: overallScore,
          scores: scores,
        };

        if (comparedResult) {
          summaryByUrl.deltas = {
            overallScore: (overallScore - comparedResult.overallScore) / comparedResult.overallScore,
            scores: scoreDeltas,
          };
        }
        summary.byUrls[url] = summaryByUrl;

      } catch (e) {
        errors.push(e);
      }
    });

    if (errors && errors.length > 0) {
      summary.errors = errors;
    }

    return summary;
  }

  async begin(url, urlListFile, output, options) {
    options = options || {};

    let startTimestamp = new Date().getTime();
    let todaysDate = this.formatDate(new Date());
    let outputFolder = `./${output}/${todaysDate}`;

    console.log(`Creating output folder: ${outputFolder}`.yellow);
    await exec(`mkdir -p "${outputFolder}"`);

    let response;

    if (urlListFile) {
      if (!fse.existsSync(urlListFile)) {
        throw new Error(`Unable to locate file "${urlListFile}".`);
      }
      response = await this.runUrlList(urlListFile, outputFolder, options);

    } else if (url) {
      response = await this.runSingleUrl(url, outputFolder, options);

    } else {
      throw new Error('Missing either url or urls parameters.');
    }

    if (options.verbose) {
      console.log('Response: '.yellow);
      console.log(response);
    }

    let endTimestamp = new Date().getTime();
    response.elapsedSeconds = (endTimestamp - startTimestamp) / 1000;

    // Write summary file.
    fse.outputFileSync(
      path.resolve(`${outputFolder}/summary.json`),
      JSON.stringify(response, null, 2));

    if (response.errors && response.errors.length > 0) {
      console.log('Complete with errors: '.yellow);
      console.log(response.errors);
    } else {
      console.log(response.status.green);
    }
  }
}

module.exports = AutoUX;
