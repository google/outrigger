/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const Audit = require('lighthouse').Audit;
const hasFormTag = require('./has-form-tag');
const hasAutocomplete = require('./has-autocomplete');
const hasValidAutocomplete = require('./has-valid-autocomplete');
const hasAppropriateInputType = require('./has-appropriate-input-type');

class AutocompleteAudit extends Audit {
  static get meta() {
    const learnMoreURL = 'https://developers.google.com/web/fundamentals/design-and-ux/input/forms/#use_metadata_to_enable_auto-complete';
    return {
      id: 'autocomplete',
      title: 'Input elements use metadata to enable autocomplete',
      failureTitle: 'Input elements do not have correct attributes for autocomplete',
      description: `To reduce user manual input work, each input element should have appropriate "name" and "autocomplete" attributes to reduce user manual input. Consider enabling autocomplete with setting autocomplete attribute and ensure every values are correct. Also make sure all input elements are under form element, and having appropriate "type" attribute. [Learn more](${learnMoreURL})`,
      requiredArtifacts: ['CompletedDOM'],
    };
  }

  static audit(artifacts) {
    const results = [
      hasFormTag.audit(artifacts),
      hasAutocomplete.audit(artifacts),
      hasValidAutocomplete.audit(artifacts),
      hasAppropriateInputType.audit(artifacts),
    ];

    const totalResult = results.reduce((prev, current) => {
      prev.score += current.score;
      if (!prev.numericValue || (prev.numericValue > current.numericValue)) {
        prev.numericValue = current.numericValue;
      }
      if (current.details) {
        if (!prev.details) {
          prev.details = current.details;
        } else {
          prev.details.items = prev.details.items.concat(current.details.items);
        }
      }
      return prev;
    }, {score: 0, numericValue: null, details: null});
    const averageScore = totalResult.score / results.length;

    return {
      score: averageScore,
      numericValue: totalResult.numericValue,
      details: totalResult.details ? totalResult.details : null
    };
  }
}

module.exports = AutocompleteAudit;
