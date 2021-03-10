/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const assert = require('assert');
const AutoUX = require('../../../utils/cli');

/* eslint-env jest */

// Set timeout to 1 min.
jest.setTimeout(1000 * 60);

let autoux;

describe('AutoUX CLI', () => {
  beforeEach(async () => {
    autoux = new AutoUX();
  });

  it('returns summary with a list of results with comparison', () => {
    let results = [{
      requestedUrl: 'https://url-1.com',
      categories: {
        ux: {score: 1}
      },
      audits: {
        'audit-1': {
          score: 1,
        },
        'audit-2': {
          score: 1,
        },
      }
    }];

    let comparedResults = {
      'https://url-1.com': {
        overallScore: 1,
        scores: {
          'audit-1': 1,
          'audit-2': 1,
        }
      }
    };

    let summary = autoux.summarize(results, comparedResults);
    expect(summary).toEqual({
      'byUrls': {
        'https://url-1.com': {
          'overallScore': 1,
          'scores': {
            'audit-1': 1,
            'audit-2': 1
          },
          'deltas': {
            'overallScore': 0,
            'scores': {
              'audit-1': 0,
              'audit-2': 0
            }
          }
        }
      },
      'byAudits': {
        'audit-1': [
          1
        ],
        'audit-2': [
          1
        ]
      },
      'deltas': {
        'audit-1': [
          0
        ],
        'audit-2': [
          0
        ]
      }
    });
  });

  it('returns summary with a list of results with variation of URLs', () => {
    let results = [{
      requestedUrl: 'https://url-1.com',
      categories: {
        ux: {score: 1}
      },
      audits: {
        'audit-1': {
          score: 1,
        },
      }
    }, {
      requestedUrl: 'https://url-2.com/',
      categories: {
        ux: {score: 1}
      },
      audits: {
        'audit-1': {
          score: 1,
        },
      }
    }];

    let summary = autoux.summarize(results);

    expect(summary).toEqual({
      'byUrls': {
        'https://url-1.com': {
          'overallScore': 1,
          'scores': {
            'audit-1': 1,
          },
        },
        'https://url-2.com': {
          'overallScore': 1,
          'scores': {
            'audit-1': 1,
          },
        }
      },
      'byAudits': {
        'audit-1': [
          1, 1
        ],
      },
    });
  });
});
