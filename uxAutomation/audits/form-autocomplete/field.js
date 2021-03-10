/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Audit = require('lighthouse').Audit;

class AutocompleteField extends Audit {
  /**
   * @param {string} fieldName
   * @return {LH.Audit.Meta}
   */
  static getMeta(fieldName) {
    return {
      id: '',
      title: `Implements autocomplete for ${fieldName}`,
      failureTitle: `Does not implement autocomplete for ${fieldName}`,
      description: `Form fields for ${fieldName} should include the autocomplete attribute.`,
      requiredArtifacts: ['FormFields'],
    };
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @param {string} name
   * @param {string} autocomplete
   * @return {LH.Audit.Product}
   */
  static auditField(artifacts, name, autocomplete) {
    const formFields = artifacts.FormFields;
    const field = formFields.find(f => (f.name || '').toLowerCase() === name);
    let score = 0;
    /** @type {string|undefined} */
    let explanation = undefined;

    if (!field) {
      return {
        score: null,
        notApplicable: true,
        explanation: 'Form field not present.',
      };
    }

    if (!!field && field.autocomplete === autocomplete) {
      score = 1;
    } else {
      explanation = `The field '${name}' is missing autocomplete attribute of '${autocomplete}'.`;
    }

    return {
      score,
      explanation,
    };
  }
}

module.exports = AutocompleteField;
