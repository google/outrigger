/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * Set of input types.
 * https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute
 */
const text = ['hidden', 'text', 'search'];
const inputTypeGroup = {
  text: text,
  password: text.concat('password'),
  url: text.concat('url'),
  email: text.concat('email'),
  tel: text.concat('tel'),
  numeric: text.concat('number'),
  month: text.concat('month'),
  date: text.concat('date')
};

/**
 * Set of autocomplete values
 */
const autocompleteTypeMap = {
  text: [
    'name',
    'honorific-prefix',
    'given-name',
    'additional-name',
    'family-name',
    'honorific-suffix',
    'nickname',
    'organization-title',
    'username',
    'organization',
    'street-address',
    'address-line1',
    'address-line2',
    'address-line3',
    'address-level4',
    'address-level3',
    'address-level2',
    'address-level1',
    'country',
    'country-name',
    'postal-code',
    'cc-name',
    'cc-given-name',
    'cc-additional-name',
    'cc-family-name',
    'cc-number',
    'cc-csc',
    'cc-type',
    'transaction-currency',
    'language',
    'sex',
    'tel-country-code',
    'tel-national',
    'tel-area-code',
    'tel-local',
    'tel-local-prefix',
    'tel-local-suffix',
    'tel-extension'
  ],
  password: ['new-password', 'current-password', 'one-time-code'],
  month: ['cc-exp'],
  date: ['bday'],
  numeric: ['cc-exp-month', 'cc-exp-year', 'transaction-amount', 'bday-day', 'bday-month', 'bday-year'],
  url: ['url', 'photo', 'impp'],
  tel: ['tel'],
  email: ['email']
};

/**
 * Get the list of valid input types corresponding to passed autocomplete value.
 * @param {String} autocompleteValue
 */
const getValidInputTypes = autocompleteValue => {
  const group = Object.keys(autocompleteTypeMap).find(type => {
    const values = autocompleteTypeMap[type];
    return autocompleteValue.split(/\s+/g).some(value => values.includes(value));
  });

  return group ? inputTypeGroup[group] : null;
};

const autocompleteFieldNames = [].concat.apply([], Object.values(autocompleteTypeMap));

module.exports = {
  autocompleteFieldNames,
  getValidInputTypes
};
