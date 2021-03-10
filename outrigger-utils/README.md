## SimpleTest Sample Usage

```js
const Outrigger = require('utils').Outrigger;
const myFunction = (url, Outrigger) = {
  console.log(this == Outrigger);
  console.log("I'm going to test " + url);
}
const default = {myTest: null};
const tester = new Outrigger(default, myFunction, true);

exports.myTest = tester.simpleListener;
```
