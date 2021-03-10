/* @license Copyright 2019 Google Inc. All Rights Reserved
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

/**
 * Implements a Lighthouse audit to check if form elements are providing
 * validation in real time to the user.
 */
class InputValidationAudit extends Audit {
  /**
   * Returns the metadata for the audit.
   */
  static get meta() {
    return {
      id: 'form-validation',
      title: 'Input elements have realtime validation.',
      failureTitle: 'Input elements do not all have real time validation.',
      description: 'Input elements should all validate user input while the user is entering data in the element',
      requiredArtifacts: ['CompletedDOM']
    };
  }

  /**
   * Performs the actual lighthouse audit on the provided page.
   * @param {*} artifacts The artifacts provided by lighthouse for the audit.
   * This must include a CompletedDOM property.
   * @param {*} context The context the audit was performed in.
   * @return {!object} The audit results.
   */
  static audit(artifacts, context) {
    const { JSDOM } = jsdom;
    const dom = new JSDOM(artifacts.CompletedDOM, {});
    const pageDocument = dom.window.document;

    let inputElements = Array.from(pageDocument.getElementsByTagName('input'));
    inputElements = inputElements.filter(e => e.type === 'text');

    inputElements = inputElements.filter(e => e.getAttribute('role') !== 'searchbox');

    if (inputElements.length === 0) {
      return {
        score: 1,
        notApplicable: true,
      };
    }

    const failedElements = inputElements.filter(e =>
      (!(e.type === 'text' && (e.hasAttribute('required') || e.hasAttribute('pattern')))))
	  .map(e => {return {element_id: e.id, element_html: e.outerHTML, };});

    if (failedElements.length !== 0) {
      const headings = [
        {key: 'element_id', itemType: 'text', text: 'Element ID'},
        {key: 'element_html', itemType: 'text', text: 'Element HTML'},
      ];
      return {
        score: 1 - (failedElements.length / inputElements.length),
        numericValue: failedElements.length,
        displayValue: 'Input element found without validation',
        details: Audit.makeTableDetails(headings, failedElements),
      };
    } else {
      return {
        score: 1,
        numericValue: 0,
        displayValue: 'Input elements use validation.',
      };
    }
  }
}

module.exports = InputValidationAudit;
