/**
 * @fileoverview Mock @google-cloud/secret-manager.SecretManagerServiceClient
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
 * Mock SecretManagerServiceClient for tests.
 *
 * The code under test gets an API key from the cloud secrets manager. We mock
 * the call to the API, so we just need to return something to keep the test
 * going.
 */
class SecretManagerServiceClient {
  /**
   * Returns a fake payload when asked for a secret.
   *
   * @return {!object} A mock secrets payload.
   */
  accessSecretVersion() {
    return [{
      payload: {
        data: '12345',
      },
    }];
  }
}

module.exports.SecretManagerServiceClient = SecretManagerServiceClient;
