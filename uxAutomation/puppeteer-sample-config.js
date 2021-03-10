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
 * @fileoverview This is a custom configuration for the lighthouse tool to run
 * the audits required for UX.
 *
 */

'use strict';

/** @type {LH.Config.Json} */
const uxConfig = {
  extends: 'lighthouse-default',
  settings: {
    throttlingMethod: 'devtools',
    onlyCategories: ['ux'],
  },

  passes: [{
    passName: 'waitForDomPass',
    useThottling: false,
    cpuQuietThresholdMs: 5000,
    gatherers: [
      {path: 'gatherers/sample-gatherer.js'},
    ],
  }],

  audits: [
    {path: 'audits/example/sample-audit.js'},
  ],

  categories: {
    ux: {
      title: 'User Experience',
      description: 'Enable web developers and product managers to create delightful user experience by providing automated UX audits via tools, manual guidance via industry best practices, and continuous improvement via real time user feedback and conversion data.',
      auditRefs: [
        {id: 'sample-audit', weight: 1},
      ],
    },
  },
};

module.exports = uxConfig;
