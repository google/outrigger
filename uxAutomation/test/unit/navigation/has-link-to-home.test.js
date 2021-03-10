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
 */

const HasLinkToHomeAudit = require('../../../audits/navigation/has-link-to-home.js');

/* eslint-env jest */

describe('The page has at least one anchor link back to home', () => {
  it('checks if there are anchors with root path', async () => {
    const artifacts = {
      URL: {finalUrl: 'https://example.com/test/page'},
      CompletedDOM: '<a href="/">Back to home</a>'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await HasLinkToHomeAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });

  it('checks if there are anchors with domain path', async () => {
    const artifacts = {
      URL: {finalUrl: 'https://example.com/test/page'},
      CompletedDOM: '<a href="https://example.com/">Back to home</a>'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await HasLinkToHomeAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });

  it('checks if there is an anchor link with query parameters', async () => {
    const artifacts = {
      URL: {finalUrl: 'https://example.com/test/page'},
      CompletedDOM: '<a href="/?foo=bar">Back to home</a>'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await HasLinkToHomeAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });

  it('checks if there are anchors with domain path having query parameters', async () => {
    const artifacts = {
      URL: {finalUrl: 'https://example.com/test/page'},
      CompletedDOM: '<a href="https://example.com?foo=bar">Back to home</a>'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await HasLinkToHomeAudit.audit(artifacts, context);

    expect(result.score).toEqual(1);
  });

  it('checks if there are multiple matched anchors', async () => {
    const artifacts = {
      URL: {finalUrl: 'https://example.com/test/page'},
      CompletedDOM: '<a href="/">Back to home</a>' +
          '<a href="https://example.com/">Back to home</a>'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await HasLinkToHomeAudit.audit(artifacts, context);

    expect(result.numericValue).toEqual(2);
  });

  it('checks if there is no matched anchors ', async () => {
    const artifacts = {
      URL: {finalUrl: 'https://example.com/test/page'},
      CompletedDOM: '<a href="https://example.com/other/page">To another page</a>'
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await HasLinkToHomeAudit.audit(artifacts, context);

    expect(result.score).toEqual(0);
  });
});
