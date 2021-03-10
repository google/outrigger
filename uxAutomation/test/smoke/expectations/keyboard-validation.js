/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * @fileoverview Smoke test for the input elements type attributes
 * use validation Lighthouse ux audit.
 */

'use strict';

/**
 * Expected Lighthouse audit values for the keyboard type validation test.
 */
module.exports = [
  {
    lhr: {
      requestedUrl: 'http://localhost:8081/keyboard-validation.html',
      finalUrl: 'http://localhost:8081/keyboard-validation.html',
      audits: {
        'keyboard-validation': {
          score: 1,
          numericValue: 2
        },
      },
    },
  },
];
