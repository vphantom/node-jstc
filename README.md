# node-jstc

[![Build Status](https://travis-ci.org/vphantom/node-jstc.svg?branch=v1.0.0)](https://travis-ci.org/vphantom/node-jstc) [![Coverage Status](https://coveralls.io/repos/github/vphantom/node-jstc/badge.svg?branch=v1.0.0)](https://coveralls.io/github/vphantom/node-jstc?branch=v1.0.0)

Lightweight, non-sandboxing JSP-ish template compiler.

This build-time tool was created after having elected not to fork the excellent, but abandoned [doT.js](https://github.com/olado/doT) because lightness trumps sandboxing in a project where one writes one's own templates.  The general concept was inspired by a templating concept from John Resig (creator of jQuery), with added statements and sessions.  Unlike doT.js, there is no syntactic sugar for partials, conditionals or looping through arrays.

Templates are compiled into functions which return a string.  Since templates are executed in the current environment, they have access to whatever modules you may have already loaded.

## Installation

```shell
npm install jstc
```

## Usage

### Basic:

```shell
jstc templates/*.jst >render.js
```

The resulting CommonJS module exports an object in which the base name of each template exists as a method which takes one optional argument, available from within the template as `it` just like in [doT.js](https://github.com/olado/doT).

For example, if one of the files was called `templates/foo.jst` then you could display the template with:

```js
var render = require('./render.js');
var htmlSnippet = render.foo();
```

### Global client-side:

If you want to use `render` directly old-school in the browser:

```shell
jstc templates/*.jst >render.js
browserify --standalone render render.js -o render-standalone.js
```

```html
<script type="text/javascript" src="render-standalone.js"></script>
<script type="text/javascript">
document.write(render.foo());
</script>
```

### With plugin namespace support:

```shell
jstc templates/*.jst plugins/*/templates/*.jst
```

The pattern 'plugins/*/templates/*.jst' is specifically recognized at compile time and creates one property per plugin directory found in the resulting list of files, and creates methods inside each.

For example, if one file was named `plugins/foo/templates/bar.jst` you could display it with:

```js
var render = require('./render.js');
var htmlSnippet = render.foo.bar();
```

### Current call object

Template functions take an optional object argument which is available within templates as `it`.  This is fundamental to using templates in a meanginful way.

### Session library object

Template functions also have a built-in object `lib` which is hidden inside `render` (or whatever name you give the resulting object) and thus available throughout the life of the program.  You can expose anything you want to make globally available throughout your templates with `render.expose()`:

```jsp
<!-- This is template: 'foo' -->
<p><%= lib.echo(it.title) %></p>
```

```js
var render = require('./render.js');
render.expose('echo', function(s) { return s + s; });
render.foo({title: 'Testing'});  // '<p>TestingTesting</p>'
```

This `lib` comes with the following built-in:

#### lib.tohtml(string)

Escapes `string` for HTML output.  Specifically escapes '&', '<', '>', single and double quotes, '/'.

## Template syntax

The basic tags use the JSP/ASP syntax, opening with `<%` and closing with `%>`.

In Vim, setting highlighting to "jsp" works well.

### Interpolation

Expressions are between `<%=` and `%>` and the result of their evaluation is inserted in place.

```jsp
<!-- This is template 'foo' -->
<h1><%= it.title %></h1>
```

```js
// Invoke template 'foo'
var htmlSnippet = render.foo({ 'title': "Test" });
```

### Evaluation

Statements are between `<%` and `%>` and are kept unchanged in the resulting function source code.  **There is no sandbox,** so it is up to you to keep templates clean of malicious code.

```jsp
<p>This is:
<% if (it.decision) { %>
truthy
<% } else { %>
falsy
<% } %>
</p>
```
