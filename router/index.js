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
 * @fileoverview Router is responsible for routing incoming functions to the
 * appropriate Cloud function in Outrigger. Function codes are defined in
 * tasks.json. If matched, the router will place the appropriate message into
 * a PubSub queue for processing by the Cloud Function.
 */


/**
 * Tasks.json contains the task codes that have been defined for cloud functions
 * @type {{tasks: !Array<{taskName: string,
 *         taskCode: string, authorLdap: string}>}}
 */
const {tasks} = require('./tasks.json');

const {PubSub} = require('@google-cloud/pubsub');

// Get a list of task codes we want to check against.
const /** !Object<string, string> */ taskCodes =
    tasks.map(task => task.taskCode);
// Create a pubsub client.
const /** !PubSub */ pubSubClient = new PubSub();

/**
 * Accepts a request from the user, retrives parameters, and publishes a message
 * @param {!Object} req Cloud Function request context. More info:
 *   https://expressjs.com/en/api.html#req
 * @param {!Object} res Cloud Function response context. More info:
 *   https://expressjs.com/en/api.html#res
 */
exports.route = (req, res) => {
  try {
    // Extract base query params w/ deconstruction
    const {
      /** string */ targetLocation,
      /** string */ target,
      /** string */ url,
      /** !Object<string, string> */...rest
    } = req.query;

    // Check that all necessary params exist.
    if (!target || !url || !targetLocation) {
      // If all necessary query params don't exist
      // return a 400 (bad request) error with message.
      res.status(400).send(
          'Malformed URL. A valid URL must include' +
          ' a url, target, and targetLocation');
    }

    // Check if the optional region param is present.
    // No region results in the default cloud function
    // Which is located in AMER (US)
    const /* string */ region =
        rest.hasOwnProperty('region') ? rest.region : null;

    // Iterate through rest, removing task/region codes if present
    // This distills any remaining args that might be present
    // Args are potentially used for task specific purposes
    let /* !Object<string, string> */ args =
        Object.keys(rest)
            .filter(key => !taskCodes.includes(key) || key !== 'region')
            .reduce((obj, key) => {
              obj[key] = rest[key];
              return obj;
            }, {});

    // If the object is empty, set to null for the message
    args = (Object.keys(args).length != 0) ? args : null;

    /**
     * Stores data we are passing to downstream objects
     * @type {{targetLocation: string, url: string,
     *   args: ?Object<string, string>, target: string, taskCode: string}}
     */
    let customBuffer = {targetLocation, url, args};

    /**
      Valid process targets are those included in task.json. Iterate through all
      tasks, and if that task is included in the query params, we can publish a
      message to that topic. This is an asynchronous process, so we need to wrap
      this series of requests in a promise so that we can return a single
      response with all downstream processes and the message id of the new
      message for that topic.
    */
    Promise
        .all(taskCodes.map(task => {
          if (req.query[task] == 'true') {
            customBuffer.target = `${target}_${task}`;
            // If region is not null, we append the region with a dash
            // i.e. if region is 'emea', we route to 'task-emea'
            customBuffer.taskCode = region ? `${task}-${region}` : task;
            return publishMessage(
                       pubSubClient, customBuffer, customBuffer.taskCode)
                .then(msg => {
                  return {'process': customBuffer.taskCode, 'messageId': msg};
                });
          }
        }))
        .then(result => res.send(result));
  } catch (err) {
    console.log(err);
    // Logs to GCP:
    // https://pantheon.corp.google.com/logs/query?project=msites-outrigger
    res.status(500).send(`Server Error: ${err}`);
  }
};

/**
 * Accepts a request from the user, retrives parameters, and publishes a message
 * @param {!PubSub} pubSubClient PubSub client used for sending messages
 * @param {!Object} customBufferObject Buffer object with information to encode
 * @param {string} topicName Name of topic to publish to
 * @return {string} The message ID of the published message
 */
async function publishMessage(pubSubClient, customBufferObject, topicName) {
  const /** string */ customBufferJson = JSON.stringify(customBufferObject);
  const /** string */ message = await pubSubClient.topic(topicName).publish(
      Buffer.from(customBufferJson));
  console.log(`Published ${message} w/ buffer ${customBufferJson}`);
  return message;
}
