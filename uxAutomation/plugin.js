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
 */
 'use strict';
 /** @type {LH.Config.Plugin} */
 module.exports = {
  // Additional audits to run on information Lighthouse gathered.
  audits: [
    {path: 'lighthouse/lighthouse-core/audits/accessibility/label.js'},
    {path: 'lighthouse/lighthouse-core/audits/accessibility/color-contrast.js'},
    {path: 'lighthouse/lighthouse-core/audits/content-width.js'},
    {path: 'lighthouse/lighthouse-core/audits/seo/tap-targets.js'},
    {path: 'lighthouse/lighthouse-core/audits/seo/font-size.js'},
    {path: 'lighthouse-plugin-autoux/audits/form-autocomplete/autocomplete.js'},
    {path: 'lighthouse-plugin-autoux/audits/form-validation/form-validation.js'},
    {path: 'lighthouse-plugin-autoux/audits/keyboard/keyboard-validation.js'},
    {path: 'lighthouse-plugin-autoux/audits/navigation/has-link-to-home.js'},
  ],

  // A new category in the report for the plugin output.
  category: {
    title: 'UX',
    description: 'Enable web developers and product managers to create delightful user experience by providing automated UX audits via tools, manual guidance via industry best practices, and continuous improvement via real time user feedback and conversion data.',
    auditRefs: [
      {id: 'label', weight: 1},
      {id: 'color-contrast', weight: 1},
      {id: 'content-width', weight: 1},
      {id: 'tap-targets', weight: 1},
      {id: 'font-size', weight: 1},
      {id: 'autocomplete', weight: 1},
      {id: 'form-validation', weight: 1},
      {id: 'keyboard-validation', weight: 1},
      {id: 'has-link-to-home', weight: 1},
    ],
  },
};
