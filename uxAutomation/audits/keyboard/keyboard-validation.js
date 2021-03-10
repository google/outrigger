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

const Audit = require('lighthouse').Audit;
const jsdom = require('jsdom');
const { inputTypeLabelMap } = require('./keyboard-label-fields');

const getCorrespondingInput = ({labelElement, pageDocument}) => {
  const labelFor = labelElement.getAttribute('for');
  const inputList = labelFor ?
    pageDocument.querySelectorAll(`input[id='${labelFor.trim()}']`) :
    labelElement.querySelectorAll('input');

  return inputList.length > 0 ? inputList[0] : null;
};

/**
 * Implements a Lighthouse audit to check if the input prompts the
 * correct keyboards.
 */
class KeyboardValidationAudit extends Audit {
  /**
   * Returns the metadata for the audit.
   */
  static get meta() {
    return {
      id: 'keyboard-validation',
      title: 'Input elements prompt the correct keyboard.',
      failureTitle: 'Input elements might not prompt the correct keyboard.',
      description:
        'Input elements should use the type attributes to prompt the correct keyboard',
      requiredArtifacts: ['CompletedDOM']
    };
  }

  /**
   * Performs the actual lighthouse audit on the provided page.
   * @param {*} artifacts The artifacts provided by lighthouse
   * for the audit. This must include a CompletedDOM property.
   * @param {*} context The context the audit was performed in.
   * @return {object} The audit results.
   */
  static audit(artifacts, context) {
    const { JSDOM } = jsdom;
    const dom = new JSDOM(artifacts.CompletedDOM, {});
    const pageDocument = dom.window.document;

    // Get all labels that suggest keyboard types. This MVP approach is overly
    // naive approach that will likely have to be readdressed for non-English
    // languages.
    let total = 0;
    const failedElements = [];
    const labelElements = pageDocument.querySelectorAll('label');

    if (labelElements.length === 0) {
      return {
        score: 1,
        notApplicable: true,
      };
    }

    for (const label of labelElements) {
      const input = getCorrespondingInput({labelElement: label, pageDocument});
      // If the input does not exist, skip the label
      if (!input) {
        continue;
      }

      total++;

      // Get the input's type attribute and check if the type has keywords to
      // check
      const inputType = input.getAttribute('type');
      if (!inputType) {
        // Fail inputs without a type attribute
        failedElements.push(input);
        continue;
      }

      // The label is valid if it's not in a list in inputTypeLabelMap or if
      // it's in a list and the input has the matching type
      const expectedLabelNames = inputTypeLabelMap[inputType]
      const text = label.textContent.toLowerCase().trim();
      if (expectedLabelNames && expectedLabelNames.every(name => text.indexOf(name) === -1)) {
        failedElements.push(input);
      }
    }

    // Return score as 1 if all keyboard inputs are valid and the numeric value
    // to be the number of keyboards tested
    if (failedElements.length !== 0) {
      const headings = [
        { key: 'element_id', itemType: 'text', text: 'Element ID' },
        { key: 'input_type', itemType: 'text', text: 'Input type' },
        { key: 'element_html', itemType: 'text', text: 'Element HTML' },
      ];
      const tableContent = failedElements.map(e => {
        return { element_id: e.id, input_type: e.type, element_html: e.outerHTML };
      });
      return {
        score: 1 - (failedElements.length / total),
        numericValue: total - failedElements.length,
        displayValue: 'Input type does not match label for all inputs.',
        details: Audit.makeTableDetails(headings, tableContent),
      };
    } else {
      return {
        score: 1,
        numericValue: total,
        displayValue: 'Input type is correct for its label\'s wording.',
        notApplicable: total === 0 ? true : false,
      };
    }
  }
}

module.exports = KeyboardValidationAudit;
