help:
	echo "This is a subdirectory, nothing to do directly."

clean:
	rm -f test.render.js

test.render.js:
	node ../cli.js $(wildcard templates/*.jst plugins/*/templates/*.jst) templates/non-existent-regular.jst >test.render.js

.PHONY:	help clean

.SILENT:	help
