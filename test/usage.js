var test = require('tape');

var testRenderObj = require('./lib/testRenderObj.js');

var render = require('./test.render.js');

/* eslint max-len: "off" */

test('Created source file is valid client-side', function(t) {
  testRenderObj(t, render);
  t.end();
});

test.onFinish(function() {
  if (typeof phantom !== 'undefined') {
    /* global phantom: true */
    phantom.exit();
  }
});
