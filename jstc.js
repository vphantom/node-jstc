"use strict";

var fs = require("fs");

// Heavily inspired by John Resig (creator of jQuery) templating idea.
// Further inspired by doT.js (sadly abandoned to the point I couldn't use it).
// This merely compiles a template into a single-argument function which
// returns a finished string.

var jstc = {};

jstc.find = {
  interpolation: /<%=\s*([\s\S]+?)\s*%>/g,
  evaluation   : /<%\s*([\s\S]+?)\s*%>/g,
  comments     : /<!--[^>]+-->/g,
  whitespace   : /\s+/g,
  tagspace     : />\s+?</g,
  singlequotes : /'/g,
  escquotes    : /\\'/g,
  sanitize     : /[^a-zA-Z0-9_\-]+/g
};

jstc.compile = function(body) {
  var src     = "try { var out = '";
  var newFunc = null;

  src += body
    .replace(jstc.find.comments, "")
    .replace(jstc.find.whitespace, " ")
    .replace(jstc.find.tagspace, "><")
    .trim()
    .replace(jstc.find.singlequotes, "\\'")
    .replace(jstc.find.interpolation, function(m, p1) {
      return "' + (" + p1.replace(jstc.find.escquotes, "'") + ") + '";
    })
    .replace(jstc.find.evaluation, function(m, p1) {
      return "'; " + p1.replace(jstc.find.escquotes, "'") + " out += '";
    })
  ;
  src += "'; return out; } catch (e) { "
    + "return '<div class=\"terror\">' + "
    + "(e && e.message ? e.message.toString() : '') "
    + "+ '</div>'; }; ";
  try {
    newFunc = new Function("it", src);
  } catch (e) {
    src = (e && e.message ? e.message.toString() : "");

    newFunc = new Function("it",
      "return '<div class=\"terror\">"
      + src.replace(jstc.find.singlequotes, "\\'")
      + "</div>';"
    );
  }
  return newFunc;
};

// I'm willingly keeping it simpler with Sync methods for now because this is
// a build-time tool, not a library.
jstc._readdir = function(srcmode, files) {
  var
    i = 0,
    iMax = 0,
    body = "",
    bodyName = "",
    namespace = "",
    src = [],
    obj = {},
    newFunc = null,
    namespaces = {},
    namespaceRegex = /(plugins\/([^\/]+)\/)?templates\/(.+)\.jst/g,
    namespaceFunc = function(m, p1, p2, p3) {
      namespace = (p2 ? p2.replace(jstc.find.sanitize, "") : "");
      bodyName = (p3 ? p3.replace(jstc.find.sanitize, "") : "");
      return "";
    }
    ;

  if (files && files.length > 0) {
    src.push(
      "/*! Templates */",
      '"use strict";',
      "",
      "(function(context) { var render = {}; "
    );
    iMax = files.length - 1;
    for (i = 0; i <= iMax; i++) {
      namespace = "";
      bodyName = "";
      try {
        body = fs.readFileSync(files[i], {encoding: "utf-8"});
      } catch (e) {
        body = "<div class=\"terror\">Unable to read '" + files[i] + "'</div>";
      }

      // Define namespace and bodyName
      files[i].replace(namespaceRegex, namespaceFunc);
      if (bodyName === "") {
        continue;
      }

      newFunc = jstc.compile(body);

      if (
        typeof namespace === "string"
        && namespace !== ""
        && namespaces[namespace] !== true
      ) {
        namespaces[namespace] = true;
        src.push("\trender['" + namespace + "'] = {}; ");
        obj[namespace] = {};
      }
      src.push(
        "\trender"
        + (namespace !== "" ? "['" + namespace + "']" : "")
        + "['"
        + bodyName
        + "'] = "
        + newFunc.toString()
        + ";"
      );
      if (typeof namespace === "string" && namespace !== "") {
        obj[namespace][bodyName] = newFunc;
      } else {
        obj[bodyName] = newFunc;
      }
    }
    src.push(
      "if (typeof context.exports === 'object') ",
      "{ context.exports = render; } ",
      "else { context.render = render; }; ",
      "})(typeof module !== 'undefined' ? module : this);"
    );
  }
  return (srcmode ? src.join("\n") : obj);
};

jstc.getObject = jstc._readdir.bind(null, false);

jstc.getSource = jstc._readdir.bind(null, true);

module.exports = jstc;