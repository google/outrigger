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

/**
 * @fileoverview Description of this file.
 * Cloud function for ingesting from pub sub and writing to a Cloud SQL DB
 *
 * @param {object} pubSubEvent The event payload.
 * @param {object} context The event metadata.
 */

// Deploy w/
// gcloud functions deploy sqlWriter --source sqlWriter --runtime nodejs10 --trigger-http --memory 1024MB --env-vars-file=env.yaml

const mysql = require('promise-mysql');
const { v1 } = require('@google-cloud/pubsub');

const projectId = process.env.PROJECT_ID;
const subscriptionName = process.env.SQL_SUBSCRIPTION;

let pool;
const createPool = async () => {
    console.log('Connecting SQL socket');
    pool = await mysql.createPool({
        user: process.env.DB_USER,     // e.g. 'my-db-user'
        password: process.env.DB_PASSWORD,  // e.g. 'my-db-password'
        database: process.env.DB_NAME,   // e.g. 'my-database'
        socketPath:
            `/cloudsql/${process.env.SOCKET}`,
        connectionLimit: 5,
        connectTimeout: 10000,     // 10 seconds
        acquireTimeout: 10000,     // 10 seconds
        waitForConnections: true,  // Default: true
        queueLimit: 0,             // Default: 0
    });
};

createPool();

exports.sqlWriter = async (req, res) => {

    const client = new v1.SubscriberClient();
    const subscription = client.subscriptionPath(projectId, subscriptionName);
    const subRequest = {
        subscription,
        maxMessages: 10000,
    };

    const [{ receivedMessages }] = await client.pull(subRequest);

    console.log(`Received ${receivedMessages.length} messages`);

    if (!receivedMessages.length) return res.status(204).send('No messages in the SQL queue');

    const ackIds = [];
    const rows = [];

    // In order to avoid SQL write quotas, we first aggregate all inserts to the same table
    // Then we insert them all at once
    try {
        receivedMessages.forEach(({message, ackId}) => {
            console.log(Buffer.from(message.data, 'base64').toString());
            const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
            // TODO: Eventually add args back to Trix and SQL Writers
            let {targetLocation, target, args, url, taskCode, error, ...rest} = data; 
            rows.push([url, taskCode, JSON.stringify(rest), error]);
            ackIds.push(ackId);
        })
    } catch(err) {
        console.error(err);
        return res.status(500).send(`SQLWriter failed: ${err}`);
    }
    console.log(rows)
    await client.acknowledge({ subscription, ackIds });


    console.log(`INSERTING ${receivedMessages.length} ROWS...`)
    
    const statement = `INSERT INTO allResults (url, taskCode, resultJSON, error) VALUES ?;`;

    try {
        await pool.query(statement, [rows]);
        console.log(`Successfully wrote to allResults`);
    } catch (err) {
        console.log(err);
        console.log(`Write to allResults failed`);
        return res.status(500).send(`Write to allResults failed for ${receivedMessages.length} messages`);
    }

    return res.status(200).send(`Inserted ${receivedMessages.length} rows`);
}