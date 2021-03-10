/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const Audit = require('lighthouse').Audit;
const {parseDocument} = require('../common/parse-document');
const {filterAutocompletable} = require('./filter-input');
const {getValidInputTypes} = require('./input-fields');
const {makeTableDetails} = require('./make-table-details');

class AppropriateInputTypeAudit extends Audit {
  static get meta() {
    const learnMoreURL = 'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill';
    return {
      id: 'appropriate-input-type',
      title: 'Autocomplete value is on an appropriate element',
      failureTitle: 'Autocomplete value is inappropriate for type of input',
      description: `To enable autocomplete, each input needs to have an appropriate input type with autocomplete value. Type "text" is appropriate for username, type "password" is appropriate for current-password. [Learn more](${learnMoreURL})`,
      requiredArtifacts: ['CompletedDOM'],
    };
  }

  /**
   * Check input elements have appropriate type if they have autocomplete attributes.
   */
  static audit(artifacts) {
    const inputElements = Array.from(parseDocument(artifacts.CompletedDOM).querySelectorAll('input'));
    const autocompletable = filterAutocompletable(inputElements).filter(input => {
      const autocomplete = input.getAttribute('autocomplete');
      if (!autocomplete) {
        return false;
      }
      // Elements having on/off in autocomplete is not applicable
      if (['on', 'off'].includes(autocomplete.trim())) {
        return false;
      }

      return true;
    });

    if (autocompletable.length === 0) {
      return {
        score: 1,
        notApplicable: true,
      };
    }

    const failedElements = autocompletable.filter(e => {
      const type = e.getAttribute('type') || 'text';
      const autocomplete = e.getAttribute('autocomplete').toLowerCase();
      const validInputTypes = getValidInputTypes(autocomplete);

      return validInputTypes ? !validInputTypes.includes(type) : true;
    });

    let details = null;
    if (failedElements.length !== 0) {
      details = makeTableDetails({
        failureTitle: AppropriateInputTypeAudit.meta.failureTitle,
        elements: failedElements
      });
    }

    return {
      score: 1 - (failedElements.length / autocompletable.length),
      numericValue: autocompletable.length - failedElements.length,
      displayValue: failedElements.length === 0 ? 'All elements have autocomplete' : 'Some elements missing autocomplete',
      details
    };
  }
}

module.exports = AppropriateInputTypeAudit;
