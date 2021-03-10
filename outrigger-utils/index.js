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
 * @fileoverview Wrapper for a simple Outrigger test flow.
 */

const { Storage } = require('@google-cloud/storage');
const {PubSub} = require("@google-cloud/pubsub");

const pubSubClient = new PubSub(); // Create a pubsub client.

/*
 * Wrapper for common Background Cloud Function to be triggered by Pub/Sub.
 */
module.exports = {
  /**
   * Background Cloud Function to be triggered by Pub/Sub. Extracts URL and
   * response metadata and passes the URL through to the customTest provided
   * when the Outrigger was created.
   *
   * @param {!Object} dict The dictionary with data specific to this type of
   * event. The `data` field contains the PubsubMessage message. The
   * `attributes` field will contain custom attributes if there are any.
   * @param {!google.cloud.functions.Context} context The Cloud Functions event
   * metadata. The `event_id` field contains the Pub/Sub message ID. The
   * `timestamp` field contains the publish time.
   * @param {async function(string): !Object<string, !*>} func Custom function which
   *  accepts a URL input.
   * @param {!Object<string, !*>} defaults Default return value of custom
   *  function if the funciton throws an error.
   * @return {!Object}
   */
  execute: async function(dict, context, func, defaults) {
    contextData = JSON.parse(Buffer.from(dict.data, 'base64').toString());

    const url = contextData.url;
    const target = contextData.target;
    const targetLocation = contextData.targetLocation;
    const taskCode = contextData.taskCode;
    const args = contextData.args; // either has args or is null

    console.log(`Running audit on ${url}`);

    let metadata = {
      url,           // Test url
      target,        // Input Trix sheet name
      targetLocation, // Input Trix ID
      taskCode,
      args,
      error: null   // Placeholder for error message
    };

    let /** !Object<string, !*> **/ testResults;
    try {
      testResults = await func(url, args);
    }
    catch (err){
      console.warn(
          "Exception was thrown during execution of customTest. Returning " +
          " defaultResults.",
          err);
      testResults = defaults;
      metadata.error = err.message;
    }

    // Combine the metadata and test results.
    // let results = Object.assign({}, metadata, testResults);
    let results = Object.assign({}, metadata, testResults);
    return results;
  },

  /**
   * Write arbitrary data to a file in bucket as described by environmental
   * variables.
   *
   * @param {string} filename Fully qualified filename for new asset.
   * @param {!*} data The data to write to file.
   * @return {string} URL of new file.
   */
  writeToBucket: async function(filename, data) {
    const storage = new Storage({projectId: process.env.PROJECT_ID});
    const bucket = storage.bucket(process.env.BUCKET_NAME);
    const file = bucket.file(filename);
    await file.save(data, {destination: filename});
    return `https://storage.cloud.google.com/${process.env.BUCKET_NAME}/${filename}`;
  },

  /**
   * Publish a message to given topic. If you inted to publish a data object,
   *  stringify it first.
   *
   * @param {string} data Data to publish.
   * @param {string} topic Topic to publish message to.
   * @return {!google.pubsub.v1.PublishResponse} Response to published message.
   */
  publish: async function(data, topic) {
   
    let message = await pubSubClient
      .topic(topic)
      .publishMessage({json: data});

    console.log(`Published ${message} w/ data ${JSON.stringify(data)}`);
    console.log({ process: topic, messageId: message });
    return message;
  }
};
