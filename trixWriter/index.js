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

 // Deploy w/
 // gcloud functions deploy trixWriter --source trixWriter --runtime nodejs10 --trigger-http --memory 1024MB --env-vars-file=env.yaml

const TrixHelper = require('./TrixHelper');
const { google } = require('googleapis');
const { v1 } = require('@google-cloud/pubsub');

const projectId = process.env.PROJECT_ID;
const subscriptionName = process.env.TRIX_SUBSCRIPTION;


exports.trixWriter = async (req, res) => {
    const auth = await google.auth.getClient({
        scopes: [
            "https://www.googleapis.com/auth/spreadsheets"
        ]
    });
    
    const helper = new TrixHelper(auth);

    const client = new v1.SubscriberClient();
    const subscription = client.subscriptionPath(projectId, subscriptionName);
    const subRequest = {
        subscription,
        maxMessages: 10000,
      };
    
    const [{ receivedMessages }] = await client.pull(subRequest);

    console.log(`Received ${receivedMessages.length} messages`);

    if (!receivedMessages.length) return res.status(204).send('No messages in the trix queue');

    let trixData = {}
    let headerData = {}

    const ackIds = [];
    let spreadsheetId = "";
    let sheetName= "";

    try {
        receivedMessages.forEach(({ message, ackId }) => {
            data = JSON.parse(Buffer.from(message.data, 'base64').toString());
            spreadsheetId = data.targetLocation;
            sheetName = data.target;
            if (!trixData.hasOwnProperty(spreadsheetId)){
                trixData[spreadsheetId] = {
                    [sheetName]: {
                        "columnHeaders": [],
                        "data": []
                    }
                }
            } else if (!trixData[spreadsheetId].hasOwnProperty(sheetName)) {
                trixData[spreadsheetId][sheetName] = {
                    "columnHeaders": [],
                    "data": []
                }
            }

            let time = new Date();
            let dataArr = [message.messageId, time.toString()]
            let headerArr = ["messageId", "date"]

            for (const property in data) {
                // TODO(b/169360507): Eventually add args back to Trix and SQL Writers
                if (!["targetLocation", "target", "args"].includes(property)){
                    dataArr.push(data[property]);
                    headerArr.push(property);
                }
            }
            trixData[spreadsheetId][sheetName].data.push(dataArr);
            if (trixData[spreadsheetId][sheetName].columnHeaders.length === 0) {
                trixData[spreadsheetId][sheetName].columnHeaders.push(headerArr);
            }
            ackIds.push(ackId);
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send(`TrixWriter failed: ${err}`);
    }

    await client.acknowledge({ subscription, ackIds });

    // Used to limit usage of "checkSheet", which invokes API to check sheet existence
    let existingSheets = [];

    console.log(`WRITING ${receivedMessages.length} ROWS...`);
    try {
        for(const spreadsheet in trixData) {
            let trix = helper.openTrix(spreadsheet);
            for(const sheet in trixData[spreadsheet]) {
                console.log(`Writing to  ${spreadsheet}:${sheet}`);
                if (!existingSheets.includes(sheet)) {
                    if(await trix.checkSheet(sheet)) {
                        // if true, the sheet exist already
                        existingSheets.push(sheet);
                    } else if(await trix.createSheet(sheet)) {
                        // otherwise, we create a sheet
                        // if true, we have succeeded; we add the header
                        await trix.appendRange({
                            sheet: sheet,
                            range: "A1",
                            values: trixData[spreadsheet][sheet].columnHeaders
                          }).catch(console.log);
                    } else {
                        console.error(`Error: Sheet ${sheet} doesn't exist and couldn't be created`);
                        continue;
                    }
                }
                await trix.appendRange({
                    sheet: sheet,
                    range: "A1",
                    values: trixData[spreadsheet][sheet].data
                  }).catch(console.log);
            }
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send(`TrixWriter failed to write: ${err}`);
    }


    return res.status(200).send(`Wrote ${receivedMessages.length} rows`);
  };
