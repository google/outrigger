/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const AutocompleteAudit = require('../../../audits/form-autocomplete/has-autocomplete.js');

/* eslint-env jest */

describe('Each input has autocomplete and name attributes', () => {
  it('checks if input has name and autocomplete attributes', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" name="name" autocomplete="name">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });

  it('checks if input has only autocomplete attribute', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" autocomplete="name">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(0);
  });

  it('checks if input has only name attribute', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" name="name">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(0);
  });

  it('checks if partially failing pages have a fraction score', async () => {
    const artifacts = {
      CompletedDOM: `
        <input type="text" name="name" autocomplete="name">
        <input type="text" name="name">
      `
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(0.5);
  });

  it('checks if forms with no autocompleable fields are not applicable', async () => {
    const artifacts = {
      CompletedDOM: `
        <input type="search" name="search">
      `
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
    expect(result.notApplicable).toEqual(true);
  });

  it('checks if password field without autocomplete attribute is not applicable', async () => {
    const artifacts = {
      CompletedDOM: `
        <input type="password" name="password">
      `
    };

    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
    expect(result.notApplicable).toEqual(true);
  });
});
