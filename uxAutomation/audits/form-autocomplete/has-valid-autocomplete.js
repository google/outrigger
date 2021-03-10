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
const Audit = require('lighthouse').Audit;
const {parseDocument} = require('../common/parse-document');
const {filterAutocompletable} = require('./filter-input');
const {autocompleteFieldNames} = require('./input-fields');
const {makeTableDetails} = require('./make-table-details');

class ValidAutocompleteAudit extends Audit {
  static get meta() {
    let learnMoreURL = ''; // TODO: add learn more URL.
    return {
      id: 'valid-autocomplete-format',
      title: 'Autocomplete format is valid',
      failureTitle: 'Autocomplete value is not valid or wrong format.',
      description: `To enable autocomplete effectively, specify section name or other metadata before setting supported autocomplete value with separating by space. e.g. "section-* billing country". [Learn more](${learnMoreURL})`,
      requiredArtifacts: ['CompletedDOM'],
    };
  }

  /**
   * Check the autocomplete value is a valid format.
   * https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill
   */
  static audit(artifacts) {
    const inputElements = Array.from(parseDocument(artifacts.CompletedDOM).querySelectorAll('input'));
    const autocompletable = filterAutocompletable(inputElements);

    if (autocompletable.length === 0) {
      return {
        score: 1,
        notApplicable: true,
      };
    }

    const failedElements = inputElements.filter(input => {
      const valueString = input.getAttribute('autocomplete');
      if (!valueString) {
        return false;
      }
      const values = valueString.toLowerCase().trim().split(/\s+/g);
      if (values.length === 0) {
        return false;
      }
      // Check on/off state
      if (values.some(value => ['on', 'off'].includes(value))) {
        return false;
      }
      // Check if there is a "section-" in the first eight characters
      if (/^section-.+/.test(values[0])) {
        values.shift();
      }
      // Check if there is a term which specifies the address location
      if (['billing', 'shipping'].includes(values[0])) {
        values.shift();
      }
      // Check if there is a term which specifies the contact information
      if (['home', 'work', 'mobile', 'fax', 'pager'].includes(values[0])) {
        values.shift();
      }

      // The value is supported one, but if there is more than one value, that is invalid format.
      if (values.length === 1 && autocompleteFieldNames.includes(values[0])) {
        return false;
      }

      return true;
    });

    let details = null;
    if (failedElements.length !== 0) {
      details = makeTableDetails({
        failureTitle: ValidAutocompleteAudit.meta.failureTitle,
        elements: failedElements
      });
    }

    return {
      score: 1 - (failedElements.length / autocompletable.length),
      numericValue: autocompletable.length - failedElements.length,
      displayValue: failedElements.length !== 0 ? 'All autocompletable inputs are valid' : 'Some autocompletable inputs are invalid',
      details
    };
  }
}

module.exports = ValidAutocompleteAudit;
