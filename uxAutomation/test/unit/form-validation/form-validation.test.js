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
 * @fileoverview Unit tests for the form validation lighthouse audit.
 */

const ValidationAudit = require('../../../audits/form-validation/form-validation');

/* eslint-env jest */

describe('All input elements use the html attributes to validate input', () => {
  it('checks if the element uses the required attribute', () => {
    const artifacts = {
      CompletedDOM: '<input type="text" name="test1" required>',
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = ValidationAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });

  it('checks that input elements use the pattern attribute', () => {
    const artifacts = {
      CompletedDOM: '<input type="text" name="test2" pattern="">',
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = ValidationAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });

  it('checks that the score is correct for partially failing elements', () => {
    const artifacts = {
      CompletedDOM: '<input type ="text" name="test3" required><input type="text">',
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = ValidationAudit.audit(artifacts, context);

    expect(result.score).toEqual(0.5);
  });

  it('checks that elements without validation fail the test', () => {
    const artifacts = {
      CompletedDOM: '<input type="text" name="test2">',
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = ValidationAudit.audit(artifacts, context);

    expect(result.score).toEqual(0);
  });

  it('checks that documents with non-text input are not applicable', () => {
    const artifacts = {
      CompletedDOM: '<input type="tel" name="home_tel">',
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = ValidationAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
    expect(result.notApplicable).toEqual(true);
  });

  it('checks that search boxes are ignored by the audit', () => {
    const artifacts = {
      CompletedDOM: '<input type="text" name="searchbox" role="searchbox">',
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = ValidationAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
    expect(result.notApplicable).toEqual(true);
  });

});
