/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// this class is exposed from this module, and represents the result of a lighthouse audit (successful or otherwise)
class LighthouseResult {
  // constructor always takes the URL audited, and optionally takes a lighthouse report
  constructor(URL) {
    this.res = {}; // the .res property is an object that represents the actual result
    this.URL = URL;
  }

  getKeys() {
    return Object.keys(this.res);
  }

  // this instance method takes a lighthouse report, and "maps" it to our custom result object
  setLighthouseResult(lhr, customMap) {
    // compose the FULL map based on the custom one that was passed in, as well as the props constant defined at the top
    const map = { ...customMap };

    for (const prop in map) {
      this.res[prop] = map[prop](lhr);
    }
  }

  setCustomResult(key, value) {
    this.res[key] = value;
  }

  // this method is called when an actual error occurs, and is caught, by the auditor
  // it is passed the error message, and includes it in the result output
  setErr(msg) {
    this.res.err = msg;
    return this; // return 'this' so that methods can be chained
  }
}

module.exports = LighthouseResult;