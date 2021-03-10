/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

const AppropriateInputTypeAudit = require('../../../audits/form-autocomplete/has-appropriate-input-type');

/* eslint-env jest */
describe('Each input has an appropriate autocomplete attribute for type of input element', () => {
  it('checks if input has input type text for username autocomplete', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" name="name" autocomplete="username">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AppropriateInputTypeAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });
  it('checks if input has input type text for password autocomplete', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" name="password" autocomplete="new-password">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AppropriateInputTypeAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });
  it('checks if input has input type text for cc-exp-month autocomplete', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" autocomplete="cc-exp-month">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AppropriateInputTypeAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });
  it('checks if input has input type text for autocomplete having multiple values', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" name="name" autocomplete="section-1 username">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AppropriateInputTypeAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });
});

describe('Each input has an inappropriate autocomplete attribute for type of input element', () => {
  it('checks if input has input type tel for cc-exp-month autocomplete', async () => {
    const artifacts = {
      CompletedDOM: '<input type="tel" autocomplete="cc-exp-month">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AppropriateInputTypeAudit.audit(artifacts, context);

    expect(result.score).toEqual(0);
  });
});

describe('Not applicable', () => {
  it('checks not applicable if there are no input elements without autocomplete', async () => {
    const artifacts = {
      CompletedDOM: '<input type="text" name="firstname"><input type="number" name="givenname">'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AppropriateInputTypeAudit.audit(artifacts, context);
    expect(result.score).toEqual(1);
    expect(result.notApplicable).toEqual(true);
  })
})
