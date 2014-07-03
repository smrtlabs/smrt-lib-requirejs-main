/**
 * @license Copyright (c) 2014, smrtlabs
 * For licensing, see LICENSE
 */

"use strict";

var page = require("webpage").create(),
    system = require("system"),
    url = system.args[1];

page.open(url, function (status) {
});

page.onResourceReceived = function(response) {
    if ("end" === response.stage && "finish" === response.url.split("/").pop()) {
        console.log("np, node.js!");

        phantom.exit();
    }
};
