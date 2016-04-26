#!/usr/bin/env node

'use strict';

var jstc = require('./jstc.js');

// This is our one-liner command line tool
process.stdout.write(jstc.getSource(process.argv.splice(2)) + '\n');
process.exit(0);
