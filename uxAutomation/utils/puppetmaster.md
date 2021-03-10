# PuppetMaster

## TL;DR

PuppetMaster is a task runner library based on Puppeteer with simplified list of
steps. Similar to an integration test, mainly focus on web frontend testing.

## Getting Started

To run a flow with PuppetMaster, firstly you will need a Puppeteer page object:

```
let browser = await puppeteer.launch({...});
let page = await browser.newPage();
```

Then, define a flow like below:

```
let taskFlow = {
  steps: [{
    actionType: ActionType.SCROLL_TO,
    selector: 'form button[type="submit"]',
  }, {
    // Take a snapshot of all styles in the <form> element.
    actionType: ActionType.STYLE_SNAPSHOT,
    selector: 'form',
  }, {
    actionType: ActionType.CLICK,
    selector: 'button[type="submit"]',
    sleepAfter: 2000,
  }, {
    // Assert any style changes within the <form> element.
    actionType: ActionType.ASSERT_STYLE_CHANGE,
    selector: 'form',
  }],
};
```

Finally, run the flow with a new PuppetMaster instance:

```
let flowResult = await new PuppetMaster(page).runFlow(taskFlow);
```

The returned `flowResult` object contains the status and results from each step.
An example `flowResult`:

```
flowResult: {
  status: 'success',
  steps: [{
    actionType: ...,
    timelapse: ...,
    startTime: ...,
    endTime: ...,
    log: ...,
  }]
}
```

## Task flow and steps

A flow consists of a list of steps. Each step defines what to do or what to
verify. In each step, there are primary parameters and additional parameters,
depending on the action type.

#### Primary parameters

- `actionType` - A single action in this step. Check out the Actions section to
check all available action types.
- `selector` - The query selector to narrow the scope of this step. The default
selector will be the <body> element if the selector value is not given.

#### Additional parameters

Different action types may take different set of additional parameters. Check out
the ***Actions*** section for the additional parameters of each action type.

### Flow cycle

##### `flowResult` object

When running a flow, the core will iterate through each step and collect the
result from each step to the `flowResult` object. After iterating all steps in
`runFlow`, it returns this `flowResult` object.

A `flowResult` object with success status looks like below:

```
flowResult: {
  status: 'success',
  steps: [{
    actionType: ...,
    timelapse: ...,
    startTime: ...,
    endTime: ...,
    log: ...,
  }]
}
```

##### Failed ASSERT actions

When an ASSERT action fails, it throws Error from `runFlow` and returns the
`flowResult` with an `error` status. E.g. when it fails to check if the page
title equals to a specific value, or a specific text didn't appear on the page,
it returns an `flowResult` like below:

```
flowResult: {
  status: 'error',
  steps: [{
    actionType: ...,
    timelapse: ...,
    startTime: ...,
    endTime: ...,
    log: ...,
  }]
}
```


## Actions

##### URL
Connect to a specific URL.
- `url`

##### SLEEP
Wait in seconds.
- `value` - How long to sleep in seconds.

##### WAIT_FOR_ELEMENT
Wait for a specific element show up.
- `value` - How long to wait for in seconds.

##### TYPE_THEN_SUBMIT
Type in an input element and submit the form.
- `inputText` - The text to be entered in an Input element.

##### CLICK
Click a specific element.

##### TAP
Click a specific element.

##### SELECT
Select a specific element with a value.
- `value` - A specific value in a Select element.

##### SCROLL_TO
Scroll to a specific element.

##### ASSERT_PAGE_TITLE
Assert that the page title equals equals to a specific value.
- `value` - The value of the page title.

##### ASSERT_INNER_TEXT
Assert that an element's innerText equals to a specific value.
- `value` - The innerText of a specific element.

##### ASSERT_EXIST
Assert an element that matches the `selector`.

##### ASSERT_CONTENT
Assert a text content appears on the current page.
- `value` - The content to match for any elements in the page.

##### ASSERT_STYLE_CHANGE
Assert a style change for a component. This requires a prerequisite step of
`STYLE_SNAPSHOT` to take a snapshot of all styles of a given element.

##### STYLE_SNAPSHOT
Take a snapshot of all classes of a given element. This takes a entire DOM tree
started from a given element via `selector` parameter. The snapshot includes the
DOM hierarchy with tag name and classes.

##### SCREENSHOT
Take a screenshot of the current page.
- `filename` - The filename to write screenshot to. The default output path will
be the current directory.

##### WRITE_TO_FILE
Write page content to a file.
- `filename` - The filename to write the page's content (HTML) to. The default
output path will be the current directory.

##### CUSTOM_FUNC
Run a custom function.
- `customFunc` - A callback function that takes two parameters:
  - `step` - The step object.
  - `pageObj` - The Puppeteer page object.

Example:
```
let task = [
  {
    actionType: ActionType.CUSTOM_FUNC,
    customFunc: (step, pageObj) => {
      await page.evaluate((step) => {
        console.log(step.actionType);
      }, step);
    },
  }
];
```
