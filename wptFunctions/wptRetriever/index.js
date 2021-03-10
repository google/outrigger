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
 */

const { PubSub } = require("@google-cloud/pubsub");
const pubSubClient = new PubSub(); // Create a pubsub client.
const axios = require('axios');

const mysql = require('promise-mysql');
let pool;
const createPool = async () => {
  if (process.env.NODE_ENV == 'test') {
    console.log('Connecting to local SQL proxy');
    pool = await mysql.createPool({
      user: 'philkrie',     // e.g. 'my-db-user'
      password: 'tobydog',  // e.g. 'my-db-password'
      database: 'audits',   // e.g. 'my-database'
      host: 'localhost',
      port: 3306,
      connectionLimit: 5,
      connectTimeout: 10000,     // 10 seconds
      acquireTimeout: 10000,     // 10 seconds
      waitForConnections: true,  // Default: true
      queueLimit: 0,             // Default: 0
    });
  } else {
    console.log('Connecting SQL socket');
    pool = await mysql.createPool({
      user: 'philkrie',     // e.g. 'my-db-user'
      password: 'tobydog',  // e.g. 'my-db-password'
      database: 'audits',   // e.g. 'my-database'
      socketPath:
          `/cloudsql/cdn-optimization-finder:us-central1:auditor-database`,
      connectionLimit: 5,
      connectTimeout: 10000,     // 10 seconds
      acquireTimeout: 10000,     // 10 seconds
      waitForConnections: true,  // Default: true
      queueLimit: 0,             // Default: 0
    });
  }
};

createPool();

// gcloud functions deploy wptRetriever --runtime nodejs10 --trigger-http --source wptFunctions/wptRetriever
exports.wptRetriever = (req, res) => {
  const statement = "SELECT * FROM wpt_jobs WHERE testStatus = 'Incomplete'";

  try {
    pool.query(statement, function (err, result, fields) {
      // if any error while executing above query, throw error
      if (err) throw err;

      Object.keys(result).forEach(function(key) {
        var row = result[key];
        let url = row.url;
        let resultUrl = row.resultUrl;
        let id = row.id;

        axios.get(resultUrl).then((result) => {
          const resultJSON = result.data;
          const status = resultJSON.statusCode;
          console.log(`status: ${status}`);
          if (status >= 100 & status <= 199) {
            console.log(`test is not complete  for ${url} at ${resultUrl}, will check again in 5 minutes`);
          } else if (status >= 200 && status <= 299) {
            console.log(`test completed for ${url}!`);
            // Perform two SQL Writes
            // Update rows in wpt_jobs to Complete
            // Send results to SQL-queue
            const table = "wpt_results";
            const wptSpeedIndex = resultJSON.data.average.firstView.SpeedIndex.toString();
            const firstPaint = resultJSON.data.average.firstView.firstPaint.toString();
            const visualComplete = resultJSON.data.average.firstView.visualComplete.toString();
            const loadTime = resultJSON.data.average.firstView.loadTime.toString();
            const domInteractive = resultJSON.data.average.firstView.domInteractive.toString();
            const fullyLoaded = resultJSON.data.average.firstView.fullyLoaded.toString();
            const bytesIn = resultJSON.data.average.firstView.bytesIn.toString();
            const numRequests = resultJSON.data.average.firstView.requests.toString();
            const largestContentfulPaint = resultJSON.data.average.firstView["chromeUserTiming.LargestContentfulPaint"].toString();
            const cumulativeLayoutShift = resultJSON.data.average.firstView["chromeUserTiming.CumulativeLayoutShift"].toString();
            const rawFirstViewData = resultJSON.data.average.firstView.toString();

            updateStatus(id, pool, "Complete");

            let customBuffer = {
              table,
              url,
              resultUrl,
              wptSpeedIndex,
              firstPaint,
              visualComplete,
              loadTime,
              domInteractive,
              fullyLoaded,
              bytesIn,
              numRequests,
              cumulativeLayoutShift,
              largestContentfulPaint,
              rawFirstViewData
            }

            publishMessage(pubSubClient, customBuffer, "sql-queue")
                .then(msg => {
                  return {"process": "sql-queue", "messageId": msg};
                })
                .then(result => console.log(result));
          }
        }).catch(error => {
          if (error instanceof TypeError) {
            // TypeError indicates result issue w/ the WPT API
            updateStatus(id, pool, "Bad Data");
            console.log(`Bad data for ${url}`);
            console.log(error);
          }
        });
      });
    });
  } catch (err) {
    return res.status(400).send(err);
  }
  return res.status(200).send('WPT Check Complete');
}

function updateStatus(id, pool, status) {
  try {
    pool.query('UPDATE wpt_jobs SET testStatus = ? WHERE id = ?', [status, id],
                function (error, results, fields) {
                  if (error) throw error;
                  console.log(results);
                  console.log(fields);
    });
  } catch (err) {
    console.log("Update failed");
    throw err;
  }
}


async function publishMessage(pubSubClient, customBufferObject, topicName) {
  let customBufferJson = JSON.stringify(customBufferObject);
  let message =  await pubSubClient
    .topic(topicName) 
    .publish(Buffer.from(customBufferJson));
  console.log(`Published ${message} w/ buffer ${customBufferJson}`);
  return message;
}