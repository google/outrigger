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
 * @fileoverview
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} pubSubEvent The event payload.
 * @param {object} context The event metadata.
 */

// Deploy with:
// gcloud functions deploy wptRunner --runtime nodejs10 --trigger-topic wpt --source wptFunctions/wptRunner

const { PubSub } = require("@google-cloud/pubsub");
const axios = require('axios');
const {promisify} = require('util');

const pubSubClient = new PubSub(); // Create a pubsub client.
exports.wptRunner = async (pubSubEvent, context) => {

  const data = decodeMessage(pubSubEvent);

  const url = data.url;

  const phone = "MotoG4";
  const connection = "4G";
  const location = "Dulles";
  const browser = "Chrome";
  const locationParameter = `${location}_${phone}:${browser}.${connection}`
  // should eventually allow users to pick
  const wptRequestURL = `http://www.webpagetest.org/runtest.php?f=json&k=79ece39ed0e4450da752f48c3baf494b&video=1&location=${locationParameter}&url=${url}`;

  console.log(`Running WPT on ${url}`);
  let response;
  try {
    response = await axios.get(wptRequestURL);
  } catch (error) {
    console.log(`Failed to GET WPT: ${error}`);
    return;
  }

  let status = response.data.statusCode;
  if (status == 200) {
    let resultUrl = response.data.data.jsonUrl;
    console.log(`Result URL ${resultUrl}`);
    const testStatus = "Incomplete";
    const table = "wpt_jobs";

    let customBuffer = {
      table,
      url,
      resultUrl,
      testStatus
    }

    await publishMessage(pubSubClient, customBuffer, "sql-queue")
        .then(msg => {
          return {"process": "sql-queue", "messageId": msg};
        })
        .then(result => console.log(result));
    return;
  } else {
    console.log(`WPT response returned status ${status}, aborting`);
    console.log(response);
    return;
  }
};

async function publishMessage(pubSubClient, customBufferObject, topicName) {
  let customBufferJson = JSON.stringify(customBufferObject);
  let message =  await pubSubClient
    .topic(topicName) 
    .publish(Buffer.from(customBufferJson));
  console.log(`Published ${message} w/ buffer ${customBufferJson}`);
  return message;
}

function decodeMessage(pubSubEvent) {
  return JSON.parse(Buffer.from(pubSubEvent.data, 'base64').toString());
}