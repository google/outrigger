/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Gatherer = require('lighthouse').Gatherer;
const getElementsInDocumentString = getElementsInDocument.toString();
const getNodePathString = getNodePath.toString();

/**
 * @param {string=} selector Optional simple CSS selector to filter nodes on.
 *     Combinators are not supported.
 * @return {Array<HTMLElement>}
 */
/* istanbul ignore next */
function getElementsInDocument(selector) {
  const realMatchesFn = window.__ElementMatches || window.Element.prototype.matches;
  /** @type {Array<HTMLElement>} */
  const results = [];

  /** @param {NodeListOf<HTMLElement>} nodes */
  const _findAllElements = nodes => {
    for (let i = 0, el; el = nodes[i]; ++i) {
      if (!selector || realMatchesFn.call(el, selector)) {
        results.push(el);
      }
      // If the element has a shadow root, dig deeper.
      if (el.shadowRoot) {
        _findAllElements(el.shadowRoot.querySelectorAll('*'));
      }
    }
  };
  _findAllElements(document.querySelectorAll('*'));

  return results;
}

/**
 * Adapted from DevTools' SDK.DOMNode.prototype.path
 *   https://github.com/ChromeDevTools/devtools-frontend/blob/7a2e162ddefd/front_end/sdk/DOMModel.js#L530-L552
 * TODO: Doesn't handle frames or shadow roots...
 * @param {Node} node
 */
/* istanbul ignore next */
function getNodePath(node) {
  /** @param {Node} node */
  function getNodeIndex(node) {
    let index = 0;
    let prevNode;
    while (prevNode = node.previousSibling) {
      node = prevNode;
      // skip empty text nodes
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length === 0) continue;
      index++;
    }
    return index;
  }

  const path = [];
  while (node && node.parentNode) {
    const index = getNodeIndex(node);
    path.push([index, node.nodeName]);
    node = node.parentNode;
  }
  path.reverse();
  return path.join(',');
}

/**
 * @fileoverview
 * This gatherer collects all the form field elements including `input`, `select`,
 * and `textarea`.
 */

/**
 * @return {LH.Artifacts['FormFields']}
 */
/* istanbul ignore next */
function getFormFields() {
  const ignoredInputs = [
    'hidden',
    'button',
    'submit',
    'checkbox',
    'radio',
  ];

  /** @type {Array<HTMLInputElement>} */
  // @ts-ignore - getElementsInDocument put into scope via stringification
  const inputElements = getElementsInDocument('input, select, textarea'); // eslint-disable-line no-undef
  /** @type {LH.Artifacts['FormFields']} */
  const formFields = inputElements
    .filter(element => element.nodeName.toLowerCase() !== 'input'
      || (element.nodeName.toLowerCase() === 'input'
          && !ignoredInputs.some(type => element.type === type)))
    .map(element => {
      const form = element.closest('form');
      let formPath;

      if (form) {
        // @ts-ignore - getNodePath put into scope via stringification
        formPath = getNodePath(form); // eslint-disable-line no-undef
      }

      return {
        id: element.id,
        name: element.name,
        elementType: element.nodeName.toLowerCase(),
        inputType: element.type,
        autocomplete: element.autocomplete,
        placeholder: element.placeholder,
        formPath,
      };
    });

  return formFields;
}

class FormFields extends Gatherer {
  /**
   * @param {LH.Gatherer.PassContext} passContext
   * @return {Promise<LH.Artifacts['FormFields']>}
   */
  static getFormFields(passContext) {
    return passContext.driver.evaluateAsync(`(() => {
      ${getElementsInDocumentString};
      ${getNodePathString};
      ${getFormFields};
      return getFormFields();
    })()`, {useIsolation: true});
  }

  /**
   * @param {LH.Gatherer.PassContext} passContext
   * @return {Promise<LH.Artifacts['FormFields']>}
   */
  async afterPass(passContext) {
    const formFields = await FormFields.getFormFields(passContext);

    return formFields;
  }
}

module.exports = FormFields;
