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
    // throttlingMethod: 'devtools',
    onlyCategories: ['ux'],
  },

  passes: [{
    passName: 'waitForDomPass',
    useThottling: false,
    cpuQuietThresholdMs: 5000,
    gatherers: [
      {path: 'gatherers/completed-dom-gatherer.js'},
      {path: 'gatherers/form-fields.js'},
    ],
  }],

  audits: [
    {path: 'lighthouse/lighthouse-core/audits/accessibility/label.js'},
    {path: 'lighthouse/lighthouse-core/audits/accessibility/link-name.js'},
    {path: 'lighthouse/lighthouse-core/audits/accessibility/color-contrast.js'},
    {path: 'lighthouse/lighthouse-core/audits/content-width.js'},
    {path: 'lighthouse/lighthouse-core/audits/seo/tap-targets.js'},
    {path: 'lighthouse/lighthouse-core/audits/seo/font-size.js'},
    {path: 'audits/form-autocomplete/autocomplete.js'},
    {path: 'audits/form-validation/form-validation.js'},
    {path: 'audits/keyboard/keyboard-validation.js'},
    {path: 'audits/navigation/has-link-to-home.js'},
  ],

  categories: {
    ux: {
      title: 'User Experience',
      description:
          'Enable web developers and product managers to create delightful user experience by providing automated UX audits via tools, manual guidance via industry best practices, and continuous improvement via real time user feedback and conversion data.',
      auditRefs: [
        {id: 'label', weight: 8.33},
        {id: 'link-name', weight: 8.33},
        {id: 'color-contrast', weight: 8.63},
        {id: 'content-width', weight: 7.36},
        {id: 'tap-targets', weight: 9.04},
        {id: 'font-size', weight: 8.46},
        {id: 'autocomplete', weight: 7.5},
        {id: 'form-validation', weight: 8.33},
        {id: 'keyboard-validation', weight: 7.42},
        {id: 'has-link-to-home', weight: 7.75},
      ],
    },
  },
};

module.exports = uxConfig;
