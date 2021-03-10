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
const { parseDocument } = require('../common/parse-document');
const { filterAutocompletable } = require('./filter-input');
const {makeTableDetails} = require('./make-table-details');

class FormAudit extends Audit {
  static get meta() {
    const learnMoreURL = 'https://developers.google.com/web/fundamentals/design-and-ux/input/forms/#use_metadata_to_enable_auto-complete';
    return {
      id: 'has-form-tag',
      title: 'Input elements are wrapped in a form element',
      failureTitle: 'Input elements are not wrapped in a form element',
      description: `Input elements should be wrapped in a <form> tag to enable auto-complete. If they're not wrapped in a form tag, some browsers will not complete the form automatically. [Learn more](${learnMoreURL})`,
      requiredArtifacts: ['CompletedDOM'],
    };
  }

  static audit(artifacts) {
    const inputElements = Array.from(parseDocument(artifacts.CompletedDOM).querySelectorAll('input'));
    const autocompletableInputs = filterAutocompletable(inputElements);

    if (autocompletableInputs.length === 0) {
      return {
        score: 1,
        notApplicable: true,
      };
    }

    const failedElements = autocompletableInputs.filter(e => !(e.closest('form')));

    let details = null;
    if (failedElements.length !== 0) {
      details = makeTableDetails({
        failureTitle: FormAudit.meta.failureTitle,
        elements: failedElements
      });
    }

    return {
      score: 1 - (failedElements.length / autocompletableInputs.length),
      numericValue: autocompletableInputs.length - failedElements.length,
      displayValue: failedElements.length === 0 ? 'All elements have autocomplete' : 'Some elements missing autocomplete',
      details
    };
  }
}

module.exports = FormAudit;
