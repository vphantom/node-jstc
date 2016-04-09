/* eslint max-len: "off" */

module.exports = function(t, render) {
  t.ok(
    typeof render === "object",
    "an object is returned"
  );

  t.ok(
    "aaa" in render && "bbb" in render,
    "regular files were included"
  );

  t.ok(
    "ccc" in render,
    "file names are sanitized to become properties"
  );

  t.ok(
    "foo" in render && typeof render.foo === "object",
    "plugin namespace was included"
  );

  t.ok(
    "bar" in render.foo,
    "plugin file was included"
  );

  t.ok(
    "non-existent-regular" in render,
    "non-existent file at normal location yields a property"
  );

  t.equal(
    render["non-existent-regular"](),
    "<div class=\"terror\">Unable to read 'templates/non-existent-regular.jst'</div>",
    "non-existent file at normal location yields function that outputs the error"
  );

  t.error(
    "non-existent-irregular" in render,
    "non-existent file at unknown location yields no property"
  );
};
