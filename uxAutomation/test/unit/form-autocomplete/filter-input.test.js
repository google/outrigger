/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const {filterAutocompletable} = require('../../../audits/form-autocomplete/filter-input.js');

/* eslint-env jest */

describe('Filtering input being available for turning on autocomplete', () => {
  let input;

  beforeEach(() => {
    input = document.createElement('input');
  });

  it('checks if input with disabled attribute is filtered', () => {
    input.setAttribute('disabled', true);
    expect(filterAutocompletable([input]).length).toBe(0);
  });

  it('checks if input with readonly attribute is filtered', () => {
    input.setAttribute('readonly', true);
    expect(filterAutocompletable([input]).length).toBe(0);
  });

  it('checks if input with non text type is filtered', () => {
    const noAutoCompleteTypes = ['button', 'reset', 'file', 'image', 'radio', 'range', 'reset', 'search', 'submit', 'hidden'];
    noAutoCompleteTypes.forEach(type => {
      input.setAttribute('type', type);
      expect(filterAutocompletable([input]).length).toBe(0);
    })
  });

  it('checks if input with type text or without any type is extracted', () => {
    input.setAttribute('type', 'text');
    expect(filterAutocompletable([input]).length).toBe(1);
  });

  it('checks if input without any type is extracted', () => {
    expect(filterAutocompletable([input]).length).toBe(1);
  });

  it('checks if input with role of searchbox is filtered', () => {
    input.setAttribute('role', 'searchbox');
    expect(filterAutocompletable([input]).length).toBe(0);
  });
});
