/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Audit = require('lighthouse').Audit;

const UIStrings = {
  /** Title of a Lighthouse audit that provides detail on the useage of payment fields in a form. This descriptive title is shown to users when a page correctly implements a form attributes. */
  title: 'Implements payment fields in a single form',
  /** Title of a Lighthouse audit that provides detail on the useage of payment fields in a form. This descriptive title is shown to users when a page does not correctly implement a form attributes. */
  failureTitle: 'Does not implement payment fields in a single form',
  /** Description of a Lighthouse audit that tells the user *why* using forms correctly is important. This is displayed after a user expands the section to see more. No character length limits. 'Learn More' becomes link text to additional documentation. */
  description: 'Related form fields should belong to the same form.',
  /** Text description when no fields are found. */
  noFormFields: 'No form fields found.',
  /** Text description when fields exist but there are no forms. */
  noForms: 'Form fields should be inside a `form` element.',
  /** Text description input fields span multiple forms. */
  multipleForms: 'Payment fields should exist in the same `form` element.',
};

class AutocompletePaymentForm extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'payment-form',
      title: UIStrings.title,
      failureTitle: UIStrings.failureTitle,
      description: UIStrings.description,
      requiredArtifacts: ['FormFields'],
    };
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @return {LH.Audit.Product}
   */
  static audit(artifacts) {
    const formFields = artifacts.FormFields;

    if (formFields.length === 0) {
      return {
        score: null,
        notApplicable: true,
        explanation: UIStrings.noFormFields,
      };
    }

    const fields = AutocompletePaymentForm.getCardFields(formFields);
    const formPaths = new Set();

    /** @type {number} */
    let score = 1;
    /** @type {string|undefined} */
    let explanation = undefined;

    for (const field of fields) {
      formPaths.add(field.formPath);
    }

    if (formPaths.size > 1) {
      // multiple forms involved
      score = 0;
      explanation = UIStrings.multipleForms;
    } else if (formPaths.size === 1 && Array.from(formPaths)[0] === undefined) {
      score = 0;
      explanation = UIStrings.noForms;
    }

    return {
      score,
      explanation,
    };
  }

  /**
   * @param {LH.Artifacts.FormField[]} formFields
   * @return {LH.Artifacts.FormField[]}
   */
  static getCardFields(formFields) {
    // @ts-ignore
    return ['ccname', 'cardnumber', 'cvc', 'exp-date', 'ccmonth', 'ccyear']
      .map(name => AutocompletePaymentForm.getField(formFields, name))
      .filter(field => field); // filter out fields that haven't been found
  }

  /**
   * @param {LH.Artifacts.FormField[]} formFields
   * @param {string} fieldName
   */
  static getField(formFields, fieldName) {
    return formFields.find(f => (f.name || '').toLowerCase() === fieldName);
  }
}

module.exports = AutocompletePaymentForm;
