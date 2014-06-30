/**
 * @license Copyright (c) 2014, smrtlabs
 * For licensing, see LICENSE
 */

"use strict";

var page = require("webpage").create(),
    system = require("system"),
    url = system.args[1];

page.open(url, function (status) {
    console.log("Loaded a web page %s", url);

    phantom.exit();
});

