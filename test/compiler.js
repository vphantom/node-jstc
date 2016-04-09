var vm   = require("vm");
var test = require("tape");
var jstc = require("../jstc.js");

var testRenderObj = require("./lib/testRenderObj.js");

var props = [
  "templates/aaa.jst",
  "templates/bbb.jst",
  "templates/cc,,c.jst",
  "templates/echo.jst",
  "templates/escaping.jst",
  "plugins/foo/templates/bar.jst",
  "templates/non-existent-regular.jst",
  "templates/,,,.jst",
  "non-existent-irregular.jst"
];

/* eslint max-len: "off" */

process.chdir("test");

test("Compiler", function(t) {
  var f = null;
  var src = "<h1><%= it.title %></h1>\n"
    + "<% if (it.something) { %>\n"
    + "<p>Something</p>\n"
    + "<% } else { %>\n"
    + "<p>Other thing</p>\n"
    + "<% } %>\n"
  ;

  f = jstc.compile(src);

  t.ok(
    typeof f === "function",
    "template compiles into a function"
  );

  t.equal(
    f(),
    "<div class=\"terror\">Cannot read property 'title' of undefined</div>",
    "template without arguments yields a string error"
  );

  t.equal(
    f({}),
    "<h1>undefined</h1><p>Other thing</p>",
    "template with empty object arg contains 'undefined' replacements"
  );

  t.equal(
    f({title: "Title", something: true}),
    "<h1>Title</h1><p>Something</p>",
    "template inserts replacements and branches on condition"
  );

  src += "<% foobar { %>\n";

  f = jstc.compile(src);

  t.ok(
    typeof f === "function",
    "malformed template compiles into a function"
  );

  t.equal(
    f(),
    "<div class=\"terror\">Unexpected token {</div>",
    "malformed template runtime yields a string error"
  );

  t.end();
});

test("Create object from files", function(t) {
  var render = jstc.getObject(props);

  testRenderObj(t, render);

  t.end();
});

test("Create Javascript source string from files", function(t) {
  var src = jstc.getSource(props);
  var obj = {
    module: {
      exports: {}
    }
  };

  try {
    vm.createContext(obj);
    vm.runInContext(src, obj);
  } catch (e) {
    t.fail(e && e.message ? e.message.toString() : "Unknown evaluation error");
  }

  t.ok(
    "render" in obj && typeof obj.render === "object",
    "source compiles and creates 'render' object"
  );

  t.ok(
    "aaa" in obj.module.exports,
    "source exports its 'render' object directly"
  );

  t.ok(
    "aaa" in obj.render
    && "bbb" in obj.render
    && "ccc" in obj.render
    && "foo" in obj.render
    && "bar" in obj.render.foo,
    "all expected properties are in 'render' object"
  );

  t.error(
    src.search(/Commas/g) >= 0,
    "unusable file name yields no property"
  );

  t.end();
});
