/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * @fileoverview Unit tests for the keyboard validation lighthouse audit.
 */

const ValidationAudit = require('../../../audits/keyboard/keyboard-validation');

/* eslint-env jest */

describe('All keyboard label\'s inputs have correct type attributes', () => {
    it('Skip labels not allowlisted as keyboard labels in keyboard-label-fields.js', () => {
        const artifacts = {
          CompletedDOM: `
            <label>
              kitty-cat
              <input type="image" name="cat_test">
            </label>
          `,
        };
        const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
        const result = ValidationAudit.audit(artifacts, context);

        expect(result.score).toEqual(1);
    });

    it('Pass and not applicable if keyboard labels without a corresponding input', () => {
        const artifacts = {
            CompletedDOM: `
            <label>email</label>
            `,
        };
        const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
        const result = ValidationAudit.audit(artifacts, context);

        expect(result.score).toEqual(1);
        expect(result.notApplicable).toEqual(true);
    });

    it('Fail if a keyboard label\'s input is missing a type attribute', () => {
        const artifacts = {
            CompletedDOM: `
            <div class="email-input">
                <label for="usr-email">Email</label>
                <input name="email" id="usr-email">
            </div>
            `,
        };
        const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
        const result = ValidationAudit.audit(artifacts, context);

        expect(result.score).toEqual(0);
    });

    it('Pass correct nested inputs', () => {
    const artifacts = {
      CompletedDOM: `
        <label>
          Email
          <input type="email" name="email_test">
        </label>
      `,
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = ValidationAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });

  it('Pass correct non-nested inputs', () => {
    const artifacts = {
      CompletedDOM: `
        <div class="email-input">
          <label for="usr-email">Email</label>
          <input type="email" name="email_test" id="usr-email">
        </div>
      `,
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = ValidationAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });

  it('Pass if label text is partially matched', () => {
    const artifacts = {
      CompletedDOM: `
        <div class="email-input">
          <label for="phone-number">Phone Number</label>
          <input type="tel" id="phone-number">
        </div>
      `,
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = ValidationAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });

  it('correctly scores partial passes', () => {
    const artifacts = {
      CompletedDOM: `
        <label>
          Email
          <input type="email" name="email_test">
        </label>
        <div class="email-input">
          <label for="usr-email">Email</label>
          <input name="email" id="usr-email">
        </div>
      `
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = ValidationAudit.audit(artifacts, context);

    expect(result.score).toEqual(0.5);
  });
});
