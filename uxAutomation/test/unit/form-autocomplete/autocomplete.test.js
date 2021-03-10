/* @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

const AutocompleteAudit = require('../../../audits/form-autocomplete/autocomplete');

/* eslint-env jest */
describe('Autocomplete audit aggregates sub-audits', () => {
  it('checks if the combination of sub-audits', async () => {
    const artifacts = {
      CompletedDOM: '<form><input type="text" name="name" autocomplete="username"></form>'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AutocompleteAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });

  it('checks if the numericValue is the minimum number of passed elements from sub-audit', async () => {
    const artifacts = {
      CompletedDOM: '<form><input type="text" name="name" autocomplete="username"><input name="no-autocomplete"><input type="email" name="nickname" autocomplete="nickname"></form>'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await AutocompleteAudit.audit(artifacts, context);

    expect(result.numericValue).toEqual(1);
  });
});
