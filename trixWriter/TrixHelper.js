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

const { google } = require('googleapis');

// this is the class that the module actually exposes
class TrixHelper {
  // the helper is constructed with a client email and private key
  // these are provided by a GCP Service Account
  constructor(auth) {
    // creates a JWT auth
    // create a new google sheets client, which uses the auth above for all requests
    // this client is attached to the TrixHelper instance
    this.client = google.sheets({
      version: 'v4',
      auth,
    });
  }
  // openTrix creates a new Trix instance using the authorized client we just created, and passes it back
  openTrix(spreadsheetId) {
    return new Trix({ client: this.client, spreadsheetId });
  }
}

// this class represents a specific Trix, accessed through the client provided by the TrixHelper
class Trix {
  constructor({ client, spreadsheetId }) {
    this.client = client;
    this.spreadsheetId = spreadsheetId;
  }

  // this method gets a specific range from the trix
  async getRange(
    { sheet, range, majorDimension = 'COLUMNS' }, // takes in the sheet name, range, and major dimension
    clientOpts = {}, // also optionally takes in other client options, which get passed straight through
  ) {
    // we make the actual request, wait for the data, and pass back ONLY the values (instead of the whole response object)
    const { data } = await this.client.spreadsheets.values
      .get({
        ...clientOpts,
        spreadsheetId: this.spreadsheetId,
        range: `${sheet}!${range}`,
        majorDimension,
      })
      .catch(console.log);
    return data.values;
  }

  // this method updates a specific range in the trix
  async appendRange(
    { sheet, range, values = [[]], majorDimension = 'ROWS' }, // same as getRange, including default opts
    clientOpts = {},
  ) {
    return this.client.spreadsheets.values.append({
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      ...clientOpts,
      spreadsheetId: this.spreadsheetId,
      range: `${sheet}!${range}`,
      requestBody: {
        majorDimension,
        values,
      },
    });
  }

  // this method updates a specific range in the trix
  async updateRange(
    { sheet, range, values = [[]], majorDimension = 'COLUMNS' }, // same as getRange, including default opts
    clientOpts = {},
  ) {
    return this.client.spreadsheets.values
      .update({
        valueInputOption: 'RAW',
        ...clientOpts,
        spreadsheetId: this.spreadsheetId,
        range: `${sheet}!${range}`,
        requestBody: {
          majorDimension,
          values,
        },
      })
      .catch(console.error);
  }

  // this method checks if a sheet exists in a spreadsheet
  async checkSheet(sheetName){
    // We get the spreadsheet object
    var response = await this.client.spreadsheets.get({spreadsheetId: this.spreadsheetId});
    // iterate throught the results sheets objects
    for (const sheet of response.data.sheets) {
      // If we find the sheetname, we return true
      if (sheet.properties.title == sheetName) {
        return true;
      }
    }
    return false;
  }

  async createSheet(sheetName){
     // If we didn't find it, we attempt to create it
     var response = (await this.client.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: [{
          "addSheet": {
            "properties": {
              "title": sheetName
            }
          }
        }]
      }
    }));
    if(response.data.spreadsheetId){
      console.log(`Sheet ${sheetName} created`)
      return true;
    } else {
      console.log(`Sheet ${sheetName} failed`)
      return false;
    }
  }
}

// expose the TrixHelper
module.exports = TrixHelper;
