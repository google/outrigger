/**
 * @fileoverview Description of this file.
 */

/**
 * @license
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
 * @fileoverview Retrieves the record for a URL from the CrUX API.
 *
 * This module takes the URL to test and requests it's record from the CrUX API.
 * The results are stored as raw JSON in the current trix and the common
 * CloudSQL table.
 *
 * To access the CrUX API, an API key is required. This must be stored in the
 * GCP project's secrets store under the key 'cruxApiKey'.
 */
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const {GoogleAuth} = require('google-auth-library');
const axios = require('axios');
const {execute, publish} = require('outrigger-utils');

/**
 * Fetches the record for the given URL from the CrUX API.
 *
 * On error, the error message from axios is replaced with more relevant
 * information and then the error is thrown for the caller to deal with.
 *
 * @param {string} url The URL to fetch CrUX data for.
 *
 * @return {!object} The record for the URL from the CrUX API.
 */
async function getCruxDataForUrl(url) {
  const apiKey = await getCruxApiKey();
  const cruxUrl =
      `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${
          apiKey}`;

  try {
    const response = await axios.post(cruxUrl, {url: url});
    return response.data.record;
  } catch (error) {
    if (error.response) {
      const resp = error.response;
      if (resp.code === 400) {
        error.message = 'The CrUX API returned a 400 - ' +
            'Bad Request. Your API key is incorrect.';
      } else if (resp.code === 403) {
        error.message =
            'The CrUX API returned a 403 - Forbidden. You need an API key.';
      } else if (resp.code === 404) {
        error.message =
            `The CrUX API returned 404. There is no data for ${url}`;
      }
    } else if (error.request) {
      req = error.request;
      error.message = `There wasn an error (${
          error.code}) with the request for ${req.config.url}`;
    }
    throw error;
  }
}

/**
 * Retrieves the API key used to access the CrUX API.
 *
 * This API key must be stored in the project's secrets store under the name
 * "cruxApiKey".
 *
 * @return {string} The API key used to authenticate with the CrUX API.
 */
async function getCruxApiKey() {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });
  const authClient = await auth.getClient();
  const projectId = authClient.getProjectId();
  const secretName = `projects/${projectId}/secrets/cruxApiKey/versions/latest`;
  const secretClient = new SecretManagerServiceClient();
  const [secret] = await secretClient.accessSecretVersion({name: secretName});
  const apiKey = secret.payload.data.toString();
  return apiKey;
}

/**
 * The Cloud Function triggered by Pub/Sub.
 *
 * This function is triggered when the crixFetcher trigger topic receives a
 * message. It fetches the record for the URL in the message from the CrUX API
 * via getCruxDataForUrl and then publishes publishes the results to the trix
 * and SQL results queues.
 *
 * @param {!object} message The PubSub message that triggered the function. This
 *     message must have a url parameter.
 * @param {!object} context The event metadata. Not used here, but required for
 *     the interface.
 */
async function cruxFetcher(message, context) {
  const defaultReturn = {result: 'Failed to retrieve CrUX data'};
  const cruxResults =
      await execute(message, context, _getCruxDataForUrl, defaultReturn);
  await publish(cruxResults, process.env.TRIX_QUEUE);
  await publish(cruxResults, process.env.SQL_QUEUE);
}

// Export function for testing.
module.exports.getCruxDataForUrl = getCruxDataForUrl;
