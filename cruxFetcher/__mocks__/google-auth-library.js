/**
 * @fileoverview Mock GoogleAuth for testing.
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
 * Mock GoogleAuth class.
 *
 * The code under test gets the current project ID from a GoogleAuthClient. We
 * return a simple object that only implements the one required function.
 */
class GoogleAuth {
  /**
   * Returns a mock GoogleAuthClient object for testing.
   *
   * @return {!object} Mock GoogleAuthClient object.
   */
  getClient() {
    return {
      getProjectId: () => {
        return 'sample-project';
      },
    };
  }
}

module.exports.GoogleAuth = GoogleAuth;
