BROWSERIFY := node_modules/.bin/browserify
PHANTOMJS  := phantomjs
JSLINT     := node_modules/.bin/eslint --fix
TAP        := node_modules/.bin/faucet
ISTANBUL   := node_modules/.bin/istanbul

help:
	echo "Try one of: clean, lint, test"

clean:
	rm -fr coverage test/test.clientside.js
	$(MAKE) -C test clean

lint:
	$(JSLINT) jstc.js cli.js test/*.js

test:	test/test.render.js
	$(ISTANBUL) cover --print none --report lcov -x 'test/*' test/compiler.js |$(TAP)
	$(ISTANBUL) report text-summary
	node test/usage.js |$(TAP)
	$(BROWSERIFY) test/usage.js -o test/test.clientside.js
	$(PHANTOMJS) test/test.clientside.js |$(TAP)

test/test.render.js:
	$(MAKE) -C test test.render.js

.PHONY: help clean lint test

.SILENT:	help test
