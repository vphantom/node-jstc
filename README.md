# node-jstc

[![Build Status](https://travis-ci.org/vphantom/node-jstc.svg?branch=v1.0.0-alpha)](https://travis-ci.org/vphantom/node-jstc) [![Coverage Status](https://coveralls.io/repos/github/vphantom/node-jstc/badge.svg?branch=v1.0.0-alpha)](https://coveralls.io/github/vphantom/node-jstc?branch=v1.0.0-alpha)

Lightweight, non-sandboxing JSP-ish template compiler.

This build-time tool was created after having elected not to fork the excellent, but abandoned [doT.js](https://github.com/olado/doT) because lightness trumps sandboxing in a project where one writes one's own templates.  The general concept was inspired by a templating concept from John Resig (creator of jQuery).

Templates are compiled into single-argument functions which return a string to be displayed.  Since templates are executed in the current environment, they have access to whatever modules you have already loaded.

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
var render = require("./render.js");
var htmlSnippet = render.foo();
```

#### Global client-side

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

Here, we take advantage of the tool's convenience path parser, which creates one property per plugin directory found in the resulting list of files, and creates methods inside each.

For example, if one file was `plugins/foo/templates/bar.jst` you could display it with:

```js
var render = require("./render.js");
var htmlSnippet = render.foo.bar();
```

## Template syntax

The basic tags use the JSP/ASP syntax, opening with `<%` and closing with `%>`.

In Vim, setting highlighting to "jsp" works well.

### Interpolation

The function which templates are compiled into takes a single argument `it` which should typically be an object for use in templates:

```jsp
<!-- This is template 'foo' -->
<h1><%= it.title %></h1>
```

```js
// Invoke template 'foo'
var htmlSnippet = render.foo({ 'title': "Test" });
```

### Evaluation

If you need control statements instead of just variable or function return value insertion:

```jsp
<p>This is:
<% if (it.decision) { %>
truthy
<% } else { %>
falsy
<% } %>
</p>
```
