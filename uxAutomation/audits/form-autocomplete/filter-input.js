/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * Filter disabled / readonly inputs.
 * autocomplete isn't appplied to some input types, so skip them.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
 * @param {element[]} inputs
 * @return {element[]}
 */
const filterAutocompletable = inputs => {
  return inputs.filter(input => {
    if (input.getAttribute('disabled')) {
      return false;
    }
    if (input.getAttribute('readonly')) {
      return false;
    }
    if (input.getAttribute('aria-disabled') === 'true') {
      return false;
    }
    if (input.getAttribute('role') === 'searchbox') {
      return false;
    }

    const type = input.getAttribute('type');
    // Autocomplete can be appeared in hidden input. In that case, autocomplete attribute describes the meaning of the given value, not for filling user input. That is out of scope for the plugin.
    // https://www.w3.org/TR/html52/sec-forms.html#autofill-anchor-mantle
    const noAutoCompleteTypes = ['button', 'reset', 'file', 'image', 'radio', 'range', 'reset', 'search', 'submit', 'checkbox', 'hidden'];

    return noAutoCompleteTypes.every(noInput => noInput !== type);
  });
};

module.exports = {
  filterAutocompletable
};
