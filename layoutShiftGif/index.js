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

// gcloud functions deploy clsAnimatedGif --runtime nodejs10 --trigger-topic cls --source clsAnimatedGif --env-vars-file env.yaml
const puppeteer = require('puppeteer');
const {execute, publish, writeToBucket} = require("outrigger-utils");
const { createCanvas, loadImage } = require('canvas')
const GIFEncoder = require('gifencoder');

const Good3G = {
    'offline': false,
    'downloadThroughput': 1.5 * 1024 * 1024 / 8,
    'uploadThroughput': 750 * 1024 / 8,
    'latency': 40
  };

const phone = puppeteer.devices['Nexus 5X'];


function injectJs() {
  console.log("executing injection");
	// inject some css to highlight the offending elements
	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = '.cls_elem {border: 5px solid green; box-sizing: border-box;} .lcp_elem{border: 5px solid red; box-sizing: border-box;}';

	document.getElementsByTagName('head')[0].appendChild(style);

  window.cls = {value: 0, previousRects: [], currentRects: [], entries: []};

  try {
    const cls_po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.cls.value += entry.value;
        if(entry.sources && entry.sources.length>0) {
        // find the source of maximum size
          for(var i = 0;i < entry.sources.length; i++) {
            let source = entry.sources[i];
            let cr = source.currentRect;
            let pr = source.previousRect;
            window.cls.currentRects.push({x: cr.x, y: cr.y, width: cr.width, height: cr.height});
            window.cls.previousRects.push({x: pr.x, y: pr.y, width: pr.width, height: pr.height});
          }
        }
      }
    });

    cls_po.observe({type: 'layout-shift', buffered: true});
  } catch (e) {
  console.log(e.message);
    // Do nothing if the browser doesn't support this API.
  }
}


async function cls(url, args) {

    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
	  //headless: false,
	  //executablePath: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
      timeout: 60000
    });
    const page = await browser.newPage();
    const version = await page.browser().version();

	//await page.evaluateOnNewDocument(injectJs);
	//phone.userAgent = agent;
	await page.emulate(phone);
	const client = await page.target().createCDPSession();
    await client.send('Network.enable');

    //await client.send('Network.emulateNetworkConditions', Good3G);
    //await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });


		console.log("Processing: " + url);

	    try {
	  	// inject a function with the code from https://web.dev/cls/#measure-cls-in-javascript

	      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000});
		  //page.on('console', consoleObj => console.log(consoleObj.text()));
	  	  await page.waitFor(2000); // let's give it a bit more time, to be sure everything's loaded

		  console.log("Injecting JS...");
		  await Promise.race([
		    page.evaluate(injectJs),
		    page.waitFor(5000)
		  ]);
		  page.waitFor(2000);

		  console.log("Gathering data...");
		  let url_results = await Promise.race([
		    page.evaluate(function() {return {'cls': window.cls}}),
		    page.waitFor(5000)
		  ]);
		  if(!url_results) {
			  console.log("Couldn't retrieve results.");
			  throw new Error(`Couldn't retrieve CLS GIF results for: ${url}`);
		  }
	      let cls = url_results.cls;


		  let safepath = url.replace(/[^a-zA-Z0-9]/gi, "");


		  console.log("Getting screenshot...");
		  let screenshot_path = "/tmp/" + safepath + ".jpeg";
		  try {
			  await page.screenshot({path: screenshot_path, type: "jpeg", "quality": 30});
		  } catch(e) {console.log("Can't take screenshot: " + e.message)}

		  const encoder = new GIFEncoder(phone.viewport.width, phone.viewport.height);

		  encoder.start();
		  encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
		  encoder.setDelay(500);  // frame delay in ms
		  encoder.setQuality(10); // image quality. 10 is default.

		  // use node-canvas
		  const canvas = createCanvas(phone.viewport.width, phone.viewport.height);
		  const ctx = canvas.getContext('2d');

		  //adding to before canvas
		  await loadImage(screenshot_path).then((image) => {
              ctx.drawImage(image, 0, 0, phone.viewport.width, phone.viewport.height)
           });
		  for(var j = 0; j < cls.previousRects.length; j++) {
			  let box = cls.previousRects[j];
			  let alpha = 0.3;
			  ctx.fillStyle = 'rgba(255, 0, 0, ' + alpha + ')';
			  ctx.fillRect(box.x, box.y, box.width, box.height);
		  }
		  encoder.addFrame(ctx);

		  ctx.clearRect(0, 0, phone.viewport.width, phone.viewport.height);

		  //adding to after canvas
		  await loadImage(screenshot_path).then((image) => {
              ctx.drawImage(image, 0, 0, phone.viewport.width, phone.viewport.height)
           });
		  for(var j = 0; j < cls.currentRects.length; j++) {
			  let box = cls.currentRects[j];
			  let alpha = 0.3;
			  ctx.fillStyle = 'rgba(255, 0, 0, ' + alpha + ')';
			  ctx.fillRect(box.x, box.y, box.width, box.height);
		  }
		  encoder.addFrame(ctx);
		  encoder.finish();

      const gifBuf = encoder.out.getData();

		  let screenshotName = `${url.slice(8)}_${Date.now().toString()}-cls.gif`;

      let cls_value = cls.value;

      try {
        let screenshotUrl = await writeToBucket(screenshotName, gifBuf);
        return {screenshotUrl, cls_value};
      } catch (err) {
        console.log(err);
        throw new Error(`Screenshot error occurred while saving fil snapshop to bucket: ${url}`);
      }


	    } catch (error) {
	      console.log(error);
	    }

}



const defaultReturn = {result: 'CLS Test Failure'};

/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {!object} message The Pub/Sub message.
 * @param {!object} context The event metadata.
 */
exports.clsAnimatedGif = async (message, context) => {
  let testResults = await execute(message, context, cls, defaultReturn);
  await publish(testResults, process.env.TRIX_QUEUE);
  await publish(testResults, process.env.SQL_QUEUE);
  return;
};
