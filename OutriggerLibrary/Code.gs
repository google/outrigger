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

const SERVICE_ACCOUNT = "msites-outrigger@appspot.gserviceaccount.com"
const ROUTER_URL = "https://us-central1-msites-outrigger.cloudfunctions.net/route?";
const CRUX_API_KEY = 'AIzaSyBi8JFmu-pxPhuzycSYJsUzirE1fODRQTY';
const CrUX_URL = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${CRUX_API_KEY}`;
const VITALS = ['first_contentful_paint', 'largest_contentful_paint', 'first_input_delay', 'cumulative_layout_shift'];

/**
 * Reads the sheet and constructs two objects
 * The first consists of all requests to be sent
 * The second consists of all sheet combinations
 *
 * @param {number} identity The identity token used to authorize requests
 * @return A set of all sheets to be written to and an object of requests
 */
function constructRequests(identity) {

  if (!configurationCheck()) {
       throw Error("Appropriate permissions not set");
  }

  var headers = {
    "Authorization": "bearer " + identity
  };

  // Add a column here!
  var cloudFunctions = {
    "Auditor": { param: "swa" },
    "Web-Vitals": { param: "wvr" },
    "Lighthouse": { param: "lhr" },
    "WebPageTest": { param: "wpt" },
    "Snapper": { param: "snap" },
    "UX Automation": { param: "lhux" },
    "Font Impact Layout": { param: "fil" },
    "Layout Shift GIF": { param: "lsg" }
  }

  for (const key in cloudFunctions) {
    cloudFunctions[key].column = getByName(key, "URLs");
  }

  var requests = [];
  var sheetSet = new Set();
  var lastRow = SpreadsheetApp.getActiveSheet().getLastRow() - 1

  var urls = getByName("URL", "URLs");
  var spreadSheetIds = getByName("Sheet ID", "URLs")
  var sheetNames = getByName("Sheet Name", "URLs")
  var defaultSheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  var defaultSheetName = "results";

  // Special Parameters: should be defined by Named Ranges in the config tab

  let fullPage = SpreadsheetApp.getActiveSpreadsheet().getRangeByName("fullPage") ?
                 SpreadsheetApp.getActiveSpreadsheet().getRangeByName("fullPage").getValue() : "";

  for (var i = 0; i < lastRow; i++) {
    var testURL = encodeURIComponent(urls[i].toString());
    //Check if sheetName is empty; if it is, we use the default ('results')
    var sheetName = !!sheetNames[i][0] ? sheetNames[i] : defaultSheetName;
    //Check if sheetID is empty; if it is, we use the default (current sheet)
    var spreadSheetId = !!spreadSheetIds[i][0] ? spreadSheetIds[i] : defaultSheetId;

    var requestURL = ROUTER_URL +
      `targetLocation=${spreadSheetId}&` +
      `target=${sheetName}&` +
      `url=${testURL}`;
    atLeastOne = false;
    for (const key in cloudFunctions) {
      if (cloudFunctions[key].column && cloudFunctions[key].column[i][0]) {
        atLeastOne = true;
        requestURL += `&${cloudFunctions[key].param}=true`;
        sheetSet.add(`${spreadSheetId}.${sheetName}_${cloudFunctions[key].param}`);
      }
    }

    //Append special parameters
    if (fullPage) {
      requestURL += `&fullPage=${fullPage}`
    }

    console.log(requestURL);

    if (atLeastOne) {
      requests.push({ url: requestURL, method: "GET", headers: headers, muteHttpExceptions: true })
    }

  }
  return { requests, sheetSet };
}

/**
 * Function invoked by manual input
 * Calls constructRequests to build requests
 * Provides a prompt for the user to confirm before sending requests
 *
 * @param {number} identity The identity token used to authorize requests
 * @param {boolean} crux Flag that determine if CrUX results are retrieved
 * @return Nothing
 */
function manualRouterRequest(identity, crux) {
  try {
    var { requests, sheetSet } = constructRequests(identity);

    var message = 'Are you sure you want to launch? You are writing to the following sheets:\\n';
    for (var i = 0; i < sheetSet.size; i++) {
      message += `${Array.from(sheetSet)[i]} \\n`;
    }
    if (crux) {
      message += 'crux_results \\n';
    }

    var confirm = Browser.msgBox(message, Browser.Buttons.YES_NO);
    if (confirm == 'yes') {
      console.log(`Confirmed`);
      var numberInRequest = 100; // Number of URLs requested in one request.
      var loop = Math.ceil(requests.length / numberInRequest);
      for (var i = 0; i < loop; i++) {
        UrlFetchApp.fetchAll(requests.splice(0, numberInRequest));
      }
    } else {
      console.log(`Declined`);
    };
  } catch (err) {
    var message = `You recieved the following error: \\n\\n${err}\\n\\n \
        If a 401, make sure the sheet is registered to cloud project 462155315818. \
        (Note: the 'router' cloud function must be relaunched to recognize this change) \\n
        If a 403, you might lack permissions to invoke Outrigger. Please contact outrigger@.\\n
        If 'Appropriate permissions not set', ensure that edit access to the sheet has been \
        granted to ${SERVICE_ACCOUNT}'`
    var permissionsMessage = Browser.msgBox(message, Browser.Buttons.OK);
    throw Error(`Error in manualRouterRequest: ${err}`)
  }
  if(crux){
        getCruxData();
  }
  return;
}

/**
 * Function invoked by scheduled trigger
 * Calls constructRequests to build requests
 * Doesn't provide a prompt (since it is called in background)
 *
 * @param {number} identity The identity token used to authorize requests
 * @param {boolean} crux Flag that determine if CrUX results are retrieved
 * @return Nothing
 */
function scheduledRouterRequest(identity, doGetCrux) {
  try {
    var { requests, sheetSet } = constructRequests(identity);
    var numberInRequest = 100; // Number of URLs requested in one request.
    var loop = Math.ceil(requests.length / numberInRequest);
    for (var i = 0; i < loop; i++) {
        UrlFetchApp.fetchAll(requests.splice(0, numberInRequest));
    }
    if(doGetCrux){
        getCruxData();
    }
  } catch (err) {
    throw Error(`Error in scheduledRouterRequest: ${err}`)
  }
  return;
}

/**
 * Helper function that accesses the values of a column
 * based on the sheet and header name
 * Calls constructRequests to build requests
 * Doesn't provide a prompt (since it is called in background)
 *
 * @param {string} colName The header of the column
 * @param {string} sheetName The name of the sheet
 * @return the values in the column or null
 */
function getByName(colName, sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var data = sheet.getRange("A1:1").getValues();
  var col = data[0].indexOf(colName);
  if (col != -1) {
    return sheet.getRange(2, col + 1, sheet.getLastRow() - 1).getValues();
  } else {
    return null;
  }
}

/**
 * Helper function that checks to see if correct write permissions
 * are granted to the Outrigger service account
 * If initial check fails, asks user to allow permission change to be applied
 *
 * @return Boolean whether or not the check succeeded
 */
function configurationCheck() {
  const editors = SpreadsheetApp.getActiveSpreadsheet().getEditors().map((user) => {
    return user.getEmail();
  })
  if (!editors.includes(SERVICE_ACCOUNT)) {
    var message = `In order for Outrigger to write results to this sheet,\
     you must grant edit permission to ${SERVICE_ACCOUNT}.\
     Press "Yes" to set the correct permissions`
    var permissionsMessage = Browser.msgBox(message, Browser.Buttons.YES_NO);
    if (permissionsMessage == 'yes') {
      console.log(`Confirmed Permission Change`);
      SpreadsheetApp.getActiveSpreadsheet().addEditor(SERVICE_ACCOUNT);
      return true;
    } else {
      console.log(`Declined Permission Change`);
      return false;
    };
  }
  return true;
}

/**
 * Retrieves CrUX API Results for specified origins and writes to a seperate sheet
 *
 * @return Nothing
 */
function getCruxData() {

    var trix = SpreadsheetApp.getActiveSpreadsheet();

    // Get URLs from the sheet, removing empty rows
    const URLs = getByName("URL", "URLs").filter(row => row[0]).map(row => row[0]);

  // request all results at once
    const results = UrlFetchApp.fetchAll(URLs.map(createRequest('origin'))).map(JSON.parse);

    // this "output" matrix is what's going to get written to the trix
    const output = results.map(res => {

      Logger.log(res);

      // this row will be the actual results
      // 16 columns of data are returned from the CrUX API
      // Four metrics are returned, with Poor, Avg, Fast, and p75 for each
      // We add two columns for the original URL and the normalized URL
      if(!res.record) { return new Array(18); }

      const row = [];
      const {urlNormalizationDetails, record} = res;
      const {originalUrl, normalizedUrl} = urlNormalizationDetails;
      const {metrics} = record;

      row.push(originalUrl, normalizedUrl);

      if(!metrics) { return row; }

      // go through each web vitals category, in order
      VITALS.forEach(vital => {
        // if this metric doesn't exist, just add empty values
        if(!metrics[vital]) {row.push(...(new Array(4)));}
        // otherwise, get the values for each bucket
        else {
          const buckets = metrics[vital].histogram.map(bucket => bucket.density);
          // add the bucket values to the row
          row.push(...buckets);
          // finally, add the p75 to the row
          row.push(metrics[vital].percentiles.p75);
        }
      });

      // the row array ends up being the value in the matrix
      return row;
    });

    if (trix.getSheetByName("crux_results") == null) {
      var crux_sheet = trix.insertSheet('crux_results');
      var headerOne = ['Original URL','Origin','First Contentful Paint (FCP)','','','','Largest Contentful Paint (LCP)','','','','First Input Delay (FID)','','','','Cumulative Layout Shift (CLS)']						
      var headerTwo = ['','','Fast','Average','Slow','p75 (ms)','Fast','Average','Slow','p75 (ms)','Fast','Average','Slow','p75 (ms)','Fast','Average','Slow','p75']
      crux_sheet.appendRow(headerOne);
      crux_sheet.appendRow(headerTwo);
    }
    trix.getSheetByName("crux_results").getRange(`A3:R${output.length+2}`).setValues(output);


}

/**
 * Helper function to build requests to the CrUX API
 *
 * @param {string} urlType Can be set to 'origin' or 'url'
 * @return Nothing
 */
function createRequest(urlType) {
  return function (uri) {
    return {
      'url':CrUX_URL,
      'method': 'post',
      'payload': {
        [urlType]: uri
      },
      'muteHttpExceptions': true
    };
  };
}
