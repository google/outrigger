/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const AutocompletePaymentForm = require('../../../audits/form-autocomplete/payment-form.js');

/* eslint-env jest */

describe('Autocomplete: payment-form', () => {
  it('should pass with not applicable when no form fields are returned', () => {
    const artifacts = {
      FormFields: [],
    };

    const result = AutocompletePaymentForm.audit(artifacts);

    expect(result.notApplicable).toBe(true);
  });

  it('should pass when all payment fields are correctly tagged', () => {
    const artifacts = {
      FormFields: [
        {
          name: 'ccname',
          autocomplete: 'cc-name',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form',
        },
        {
          name: 'cardnumber',
          autocomplete: 'cc-number',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form',
        },
        {
          name: 'cvc',
          autocomplete: 'cc-csc',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form',
        },
        {
          name: 'exp-date',
          autocomplete: 'cc-exp',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form',
        },
      ],
    };

    const result = AutocompletePaymentForm.audit(artifacts);

    expect(result.score).toBe(1);
  });

  it('should pass when all payment fields are correctly tagged (month and year)', () => {
    const artifacts = {
      FormFields: [
        {
          name: 'ccname',
          autocomplete: 'cc-name',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form',
        },
        {
          name: 'cardnumber',
          autocomplete: 'cc-number',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form',
        },
        {
          name: 'cvc',
          autocomplete: 'cc-csc',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form',
        },
        {
          name: 'ccmonth',
          autocomplete: 'cc-exp-month',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form',
        },
        {
          name: 'ccyear',
          autocomplete: 'cc-exp-year',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form',
        },
      ],
    };

    const result = AutocompletePaymentForm.audit(artifacts);

    expect(result.score).toBe(1);
  });

  it('should fail when fields belong to different forms', () => {
    const artifacts = {
      FormFields: [
        {
          name: 'ccname',
          autocomplete: 'cc-name',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form1',
        },
        {
          name: 'cardnumber',
          autocomplete: 'cc-number',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form1',
        },
        {
          name: 'cvc',
          autocomplete: 'cc-csc',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form2',
        },
        {
          name: 'exp-date',
          autocomplete: 'cc-exp',
          elementType: 'input',
          inputType: 'text',
          formPath: 'form2',
        },
      ],
    };

    const result = AutocompletePaymentForm.audit(artifacts);

    expect(result.score).toBe(0);
  });

  it('should fail when fields are not in a form', () => {
    const artifacts = {
      FormFields: [
        {
          name: 'ccname',
          autocomplete: 'cc-name',
          elementType: 'input',
          inputType: 'text',
        },
        {
          name: 'cardnumber',
          autocomplete: 'cc-number',
          elementType: 'input',
          inputType: 'text',
        },
        {
          name: 'cvc',
          autocomplete: 'cc-csc',
          elementType: 'input',
          inputType: 'text',
        },
        {
          name: 'exp-date',
          autocomplete: 'cc-exp',
          elementType: 'input',
          inputType: 'text',
        },
      ],
    };

    const result = AutocompletePaymentForm.audit(artifacts);

    expect(result.score).toBe(0);
  });
});
