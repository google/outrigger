/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const Audit = require('lighthouse').Audit;
const {parseDocument} = require('../common/parse-document');
const {filterAutocompletable} = require('./filter-input');
const {makeTableDetails} = require('./make-table-details');

class HasAutoCompleteAudit extends Audit {
  static get meta() {
    const learnMoreURL = 'https://developers.google.com/web/fundamentals/design-and-ux/input/forms/#use_metadata_to_enable_auto-complete';
    return {
      id: 'has-autocomplete-attrs',
      title: 'Input elements have name and autocomplete attributes',
      failureTitle: 'Lack of name or autocomplete attribute',
      description: `Input elements should have name and autocomplete attributes to reduce user manual input. Consider enabling auto-complete with setting autocomplete attribute and ensure every values are correct. [Learn more](${learnMoreURL})`,
      requiredArtifacts: ['CompletedDOM'],
    };
  }

  /**
   * Check input elements have both name and autocomplete attributes.
   */
  static audit(artifacts) {
    const inputElements = Array.from(parseDocument(artifacts.CompletedDOM).querySelectorAll('input'));
    const autocompletableInputs = filterAutocompletable(inputElements)
      // Autocomplete isn't necessary for password field.
      .filter(input => input.getAttribute('type') !== 'password')

    if (autocompletableInputs.length === 0) {
      return {
        score: 1,
        notApplicable: true,
      };
    }

    const failedElements = autocompletableInputs.filter(e => !(e.getAttribute('autocomplete') && e.getAttribute('name')));

    let details = null;
    if (failedElements.length !== 0) {
      details = makeTableDetails({
        failureTitle: HasAutoCompleteAudit.meta.failureTitle,
        elements: failedElements
      });
    }

    return {
      score: 1 - (failedElements.length / autocompletableInputs.length),
      numericValue: autocompletableInputs.length - failedElements.length,
      displayValue: failedElements.length === 0 ? 'All elements have autocomplete' : 'Some elements missing autocomplete',
      details,
    };
  }
}

module.exports = HasAutoCompleteAudit;
