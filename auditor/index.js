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

// import auditor created by the config file
const Auditor = require('./auditorConfig');
const {execute, publish} = require("outrigger-utils");

async function audit(url, args) {
  try {
    const response = await Auditor.auditPage(url); // wait for the actual audit for this specific URL
    const auditJSON = response.res;
    console.log(JSON.stringify(auditJSON));

    return auditJSON;
  } catch (err) {
      throw new Error(`Audit error occured while auditing ${url}: ${err.message}`);
  }
};

const defaultReturn = {result: 'Auditor Test Failure'};

/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {!object} message The Pub/Sub message.
 * @param {!object} context The event metadata.
 */
exports.auditor = async (message, context) => {
  let testResults = await execute(message, context, audit, defaultReturn);
  console.log("SW Auditor Test Results:" + JSON.stringify(testResults));
  await publish(testResults, process.env.TRIX_QUEUE);
  await publish(testResults, process.env.SQL_QUEUE);
  return;
};

