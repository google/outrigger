/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const ValidAutocompleteAudit = require('../../../audits/form-autocomplete/has-valid-autocomplete.js');

/* eslint-env jest */
describe('Each autocomplete values are formatted', () => {
  it('checks if autocomplete is on', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" name="name" autocomplete="on">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });
  it('checks if autocomplete is supported field name', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" autocomplete="username">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });
  it('checks if autocomplete for password field is off', async () => {
    const artifacts = {
      CompletedDOM: '<input type="password" autocomplete="off">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });
  it('checks if autocomplete has section name in a valid format', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" autocomplete="section-1 cc-number">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });
  it('checks if autocomplete indicates shipping address in a valid format', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" autocomplete="shipping address-line1">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });
  it('checks if autocomplete indicates section, billing, work telephone number in a valid format', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" autocomplete="section-1 billing work tel">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });
  it('checks if there is no autocomplete attribute', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);
    expect(result.score).toEqual(1);
  });
});

describe('Each autocomplete values are not formatted', () => {
  it('checks if autocomplete is not supported field name', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" name="name" autocomplete="foo">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(0);
  });
  it('checks if autocomplete having section name with wrong order', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" autocomplete="cc-number section-1">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(0);
  });
  it('checks if autocomplete having billing section with wrong order', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" autocomplete="cc-number billing">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(0);
  });
  it('checks if autocomplete indicates section, billing, work telephone number with invalid format', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" autocomplete="tel section-1 billing work">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(0);
  });
  it('checks if autocomplete for password field has unsupported value', async () => {
    const artifacts = {
      CompletedDOM: '<input type="password" autocomplete="secret">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(0);
  });
  it('checks that a partially valid for returns a fractional score', async () => {
    const artifacts = {
      CompletedDOM: `
        <input type="text" autocomplete="tel section-1 billing work">
        <input type="text" autocomplete="name" name="name">
      `
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(0.5);
  });
  it('checks that forms without autocompleteable fields are nonapplicable', async () => {
    const artifacts = {
      CompletedDOM: `
        <input type="search" name="search_value">
      `
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await ValidAutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
    expect(result.notApplicable).toEqual(true);
  });
});
