/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const CatAudit = require('../../../audits/example/has-cat-images.js');
const assert = require('assert');

/* eslint-env jest */

describe('Example: has cat image audit', () => {
  it('checks if the page has at least one cat image', async () => {
    const artifacts = {
      ImageElements: [{
        src: 'https://google.com/images/cat',
        mimeType: 'image/png'
      }]
    };
    const context = {settings: {throttlingMethod: 'simulate'}, computedCache: new Map()};
    const result = await CatAudit.audit(artifacts, context);

    // Ensure it returns 100 score when there's one cat image.
    expect(result.score).toEqual(1);
  });
});
