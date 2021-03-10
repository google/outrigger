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

const Audit = require('lighthouse').Audit;

const makeTableDetails = ({failureTitle, elements}) => {
  const headings = [
    {key: 'failed_text', itemType: 'text', text: 'Failed audit'},
    {key: 'element_id', itemType: 'text', text: 'Element ID'},
    {key: 'element_html', itemType: 'text', text: 'Element HTML'},
  ];

  const tableContent = elements.map(e => {
    return {
      failed_text: failureTitle,
      element_id: e.id,
      element_html: e.outerHTML
    };
  });

  return Audit.makeTableDetails(headings, tableContent);
};

module.exports = {
  makeTableDetails
};
