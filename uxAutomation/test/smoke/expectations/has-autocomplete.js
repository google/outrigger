// @license
// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

/**
 * Expected Lighthouse audit values for form autocomplete test.
 */
module.exports = [
  {
    lhr: {
      requestedUrl: 'http://localhost:8081/autocomplete-forms.html',
      finalUrl: 'http://localhost:8081/autocomplete-forms.html',
      audits: {
        'autocomplete': {
          score: 1,
          numericValue: 2,
        }
      },
    },
  },
  /*
  {
    lhr: {
      requestedUrl: 'http://localhost:8081/autocomplete-static.html',
      finalUrl: 'http://localhost:8081/autocomplete-static.html',
      runWarnings: [],
      audits: {
        'cardname': {
          score: 1,
        },
        'cardnumber': {
          score: 1,
        },
        'cvc': {
          score: 1,
        },
        'expiration': {
          score: 1,
        },
        'payment-form': {
          score: 1,
        },
      },
    },
  },
  {
    lhr: {
      requestedUrl: 'http://localhost:8081/autocomplete-dynamic.html',
      finalUrl: 'http://localhost:8081/autocomplete-dynamic.html',
      runWarnings: [],
      audits: {
        'cardname': {
          score: 1,
        },
        'cardnumber': {
          score: 1,
        },
        'cvc': {
          score: 1,
        },
        'expiration': {
          score: 1,
        },
        'payment-form': {
          score: 1,
        },
      },
    },
  },
  {
    lhr: {
      requestedUrl: 'http://localhost:8081/autocomplete-formless.html',
      finalUrl: 'http://localhost:8081/autocomplete-formless.html',
      runWarnings: [],
      audits: {
        'cardname': {
          score: 1,
        },
        'cardnumber': {
          score: 1,
        },
        'cvc': {
          score: 1,
        },
        'expiration': {
          score: 1,
        },
        'payment-form': {
          score: 0,
        },
      },
    },
  },
  */
];
