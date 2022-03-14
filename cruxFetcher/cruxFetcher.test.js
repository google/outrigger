/**
 * @fileoverview Tests cruxFetcher implementation.
 */
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const axios = require('axios');
const {getCruxDataForUrl} = require('./index.js');

jest.mock('axios');

const cruxJsonResponse = {
  'record': {
    'key': {
      'url': 'https://web.dev/',
    },
    'metrics': {
      'cumulative_layout_shift': {
        'histogram': [
          {
            'start': '0.00',
            'end': '0.10',
            'density': 0.99030096990300964,
          },
          {
            'start': '0.10',
            'end': '0.25',
            'density': 0.0061993800619938016,
          },
          {
            'start': '0.25',
            'density': 0.0034996500349965,
          },
        ],
        'percentiles': {
          'p75': '0.00',
        },
      },
      'first_contentful_paint': {
        'histogram': [
          {
            'start': 0,
            'end': 1800,
            'density': 0.84963985594238023,
          },
          {
            'start': 1800,
            'end': 3000,
            'density': 0.10144057623049256,
          },
          {
            'start': 3000,
            'density': 0.048919567827130944,
          },
        ],
        'percentiles': {
          'p75': 1328,
        },
      },
      'first_input_delay': {
        'histogram': [
          {
            'start': 0,
            'end': 100,
            'density': 0.97180563887223048,
          },
          {
            'start': 100,
            'end': 300,
            'density': 0.017996400719856118,
          },
          {
            'start': 300,
            'density': 0.010197960407918467,
          },
        ],
        'percentiles': {
          'p75': 9,
        },
      },
      'largest_contentful_paint': {
        'histogram': [
          {
            'start': 0,
            'end': 2500,
            'density': 0.87936380914274059,
          },
          {
            'start': 2500,
            'end': 4000,
            'density': 0.081224367310192822,
          },
          {
            'start': 4000,
            'density': 0.0394118235470642,
          },
        ],
        'percentiles': {
          'p75': 1667,
        },
      },
    },
  },
  'urlNormalizationDetails': {
    'originalUrl': 'https://web.dev',
    'normalizedUrl': 'https://web.dev/',
  },
};

it('returns the CrUX record', async () => {
  axios.post.mockResolvedValueOnce({data: cruxJsonResponse});
  const testResult = await getCruxDataForUrl('https://www.web.dev');
  expect(testResult).toEqual(cruxJsonResponse.record);
});

it('thows an error on an http 400 error', () => {
  const badRequestError = new Error();
  badRequestError.response = {code: 400};
  axios.post.mockRejectedValueOnce(badRequestError);
  try {
    getCruxDataForUrl('https://web/dev');
  } catch (e) {
    expect(e.message).toBe(
        'The CrUX API returned a 400 - ' +
        'Bad Request. Your API key is incorrect.');
  }
});
