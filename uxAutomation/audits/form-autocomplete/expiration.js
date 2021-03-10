/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Audit = require('lighthouse').Audit;
const AutocompleteField = require('./field.js');

/**
 * @description Text description for expiration field with missing autocomplete attribute.
 * @example {cardnumber} name
 * @example {cc-number} autocomplete
 **/
const getDescription = (name, autocomplete) => {
  return `The expiration field '${name}' is missing autocomplete attribute of '${autocomplete}'.`;
};

class AutocompleteCardName extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      ...AutocompleteField.getMeta('expiration date'),
      id: 'expiration',
    };
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @return {LH.Audit.Product}
   */
  static audit(artifacts) {
    const formFields = artifacts.FormFields;
    const date = formFields.find(f => (f.name || '').toLowerCase() === 'exp-date');
    const month = formFields.find(f => (f.name || '').toLowerCase() === 'ccmonth');
    const year = formFields.find(f => (f.name || '').toLowerCase() === 'ccyear');

    let score = 0;
    /** @type {string|undefined} */
    let explanation = undefined;

    if (date && date.autocomplete === 'cc-exp') {
      score = 1;
    } else if (month && month.autocomplete === 'cc-exp-month'
      && year && year.autocomplete === 'cc-exp-year') {
      score = 1;
    } else if (year && month && month.autocomplete === 'cc-exp-month') {
      score = 0.5;
      // @ts-ignore
      explanation = getDescription(year.name, 'cc-exp-year');
    } else if (month && year && year.autocomplete === 'cc-exp-year') {
      score = 0;
      // @ts-ignore
      explanation = getDescription(month.name, 'cc-exp-month');
    } else if (date) {
      score = 0;
      // @ts-ignore
      explanation = getDescription(date.name, 'cc-exp');
    } else if (month && !year) {
      score = 0;
      explanation = 'No year field found.';
    } else if (year && !month) {
      score = 0;
      explanation = 'No month field found.';
    } else {
      return {
        score: null,
        notApplicable: true,
      };
    }

    return {
      score,
      explanation,
    };
  }
}

module.exports = AutocompleteCardName;
