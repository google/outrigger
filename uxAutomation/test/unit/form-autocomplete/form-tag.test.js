/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const FormAudit = require('../../../audits/form-autocomplete/has-form-tag.js');

/* eslint-env jest */

describe('Input elements are wrapped in a <form> tag', () => {
  it('checks input is wrapped in a <form> tag', async () => {
    const artifacts = {
      CompletedDOM: '<form><input type="text" autocomplete="name"></form>'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await FormAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });

  it('expects audit fails if input element is not wrapped in a form tag', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" autocomplete="name">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await FormAudit.audit(artifacts, context);

    expect(result.score).toEqual(0);
  });

  it('expects audit is not applicable if there a no autocompleteable fields', async () => {
    const artifacts = {
      CompletedDOM: '<input type="search" name="search">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await FormAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
    expect(result.notApplicable).toEqual(true);
  });

  it('expects a fractional score when some elements are not in a form', async () => {
    const artifacts = {
      CompletedDOM: `
        <form><input type="text" autocomplete="name"></form>
        <input type="text" autocomplete="address">
      `
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await FormAudit.audit(artifacts, context);

    expect(result.score).toEqual(0.5);
  });
});
