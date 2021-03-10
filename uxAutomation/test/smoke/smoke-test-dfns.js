// @license
// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

/** @type {Array<Smokehouse.TestDfn>} */
const smokeTests = [
  {
    id: 'has-autocomplete',
    expectations: require('./expectations/has-autocomplete.js'),
    config: require('../../ux-custom-config.js'),
    batch: 'has-autocomplete',
  },
  {
    id: 'form-validation',
    expectations: require('./expectations/form-validation.js'),
    config: require('../../ux-custom-config.js'),
    batch: 'form-validation',
  },
  {
    id: 'keyboard-validation',
    expectations: require('./expectations/keyboard-validation.js'),
    config: require('../../ux-custom-config.js'),
    batch: 'keyboard-validation',
  },
  {
    id: 'has-link-to-home',
    expectations: require('./expectations/has-link-to-home.js'),
    config: require('../../ux-custom-config.js'),
    batch: 'navigation',
  },
];

module.exports = smokeTests;
