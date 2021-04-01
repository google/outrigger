# outrigger-utils

`outrigger-utils` is a small wrapper library to facilitate the authoring of
Outrigger tests. `outrigger-utils` contains helper methods that handle piping
tests through various PubSub queues as well as writing to a GCP storage bucket
as defined in process environment variables.

## Sample Usage

1. Import `outrigger-utils` helper functions.

```js
const {execute, publish, writeToBucket} = require("outrigger-utils");
```
2. Write custom test code. Test code must have two arguments, `url` and `args`.
    *  `url`: The url to be tested.
    *  `args`: A dict containing all custom arguments included in test request.

```js
async function customTestFunc(url, args) {
  // Custom code that returns website analysis data
  data = doSomeAnalysisOn(url, args);
  return data;
}
```
3. Define your default return value. This is the value that is returned if the
   test fails.

```js
const defaultReturn = {result: "Test failed. Cause unknown."}
```

4. Export your cloud function. Currently, `outrigger-utils` supports [Pub/Sub Background Functions](https://cloud.google.com/functions/docs/writing/background#cloud-pubsub-example)
    , and your exported function must adhere to the documented interface.

```js
exports.customTestName = async (message, context) => {
  // Execute test
  let testResults = await execute(message, context, customTestFunc, defaultReturn);

  // Publish results to output PubSub queue
  await publish(testResults, pubsubQueue);
  return;
}
```

