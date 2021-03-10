/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const {parseDocument} = require('../../../audits/common/parse-document.js');

/* eslint-env jest */

describe('Parse document', () => {
  it('checks if document string is parsed to HTMLElement', () => {
    const documentContent = '<!doctype html><html><head></head><body><div><h1>Example Domain</h1></body></html>';
    const result = parseDocument(documentContent);
    // Since it's parsed with JSDOM, not native DOM parser, it's not an exact instance of HTMLElement.
    expect(result).toBeInstanceOf(Object);
    expect(result.querySelectorAll).toBeInstanceOf(Function);
  });
});
