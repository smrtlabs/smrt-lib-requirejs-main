/**
 * @license Copyright (c) 2014, smrtlabs
 * For licensing, see LICENSE
 */

"use strict";

/* global after: false, afterEach: false, before: false, beforeEach: false, describe: false, it: false */

var assert = require("chai").assert,
    execFile = require("child_process").execFile,
    express = require("express"),
    http = require("http"),
    path = require("path"),
    phantomjs = require("phantomjs"),
    util = require("util");

describe("smrt-lib-requirejs-extras", function () {
    var process,
        server;

    after(function (done) {
        server.close(done);
    });

    afterEach(function () {
        process.kill();
    });

    before(function (done) {
        var app = express();

        app.use(express.static(path.join(__dirname, "/../fixtures")));

        server = http.createServer(app);
        server.on("listening", done);

        server.listen();
    });

    beforeEach(function (done) {
        var request = http.request({
            "hostname": "localhost",
            "port": server.address().port,
            "path": "/minimal.test.html",
            "method": "GET"
        }, function () {
            done();
        });

        request.end();
    });

    it("does something", function (done) {
        var childArgs = [
            path.join(__dirname, "../phantomjs/runner.js"),
            util.format("http://%s:%d/%s", "127.0.0.1", server.address().port, "minimal.test.html")
        ];

        this.timeout(10000);

        console.log(phantomjs.path);
        console.log(childArgs);

        process = execFile(phantomjs.path, childArgs, function (err, stdout, stderr) {
            assert.ifError(err);

            console.log("PHANTOM_STDOUT", stdout);
            console.log("PHANTOM_STDERR", stderr);

            done();
        });
    });
});
