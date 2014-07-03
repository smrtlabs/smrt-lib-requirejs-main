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
    var app,
        process,
        requestedUrls = [],
        server;

    after(function (done) {
        server.close(done);
    });

    afterEach(function () {
        process.kill();
    });

    before(function (done) {
        var statics = express.static(global.paths.root);

        app = express();

        app.use(function (req, res, next) {
            requestedUrls.push(req.url);

            return statics(req, res, next);
        });

        server = http.createServer(app);
        server.on("listening", done);

        server.listen();
    });

    beforeEach(function (done) {
        var request = http.request({
            "hostname": "127.0.0.1",
            "port": server.address().port,
            "path": "/public/js/require.js",
            "method": "GET"
        }, function (response) {
            assert.strictEqual(response.statusCode, 200);
            response.on("data", function () {
                // noop
            });
            response.on("end", function () {
                requestedUrls = [];

                done();
            });
        });

        request.end();
    });

    it("checks if every requested url is loaded", function (done) {
        var childArgs = [
            path.join(global.paths.root, "phantomjs/runner.js"),
            util.format("http://%s:%d/%s", "127.0.0.1", server.address().port, "/smrt-lib-requirejs-extras/fixtures/minimal.test.html")
        ];

        process = execFile(phantomjs.path, childArgs, function (err, stdout, stderr) {
            assert.ifError(err);

            assert.deepEqual([
                "/finish",
                "/public/js/a.js",
                "/public/js/mymain.js",
                "/public/js/require.js",
                "/smrt-lib-requirejs-extras/fixtures/minimal.test.html"
            ].sort(), requestedUrls.sort());

            done();
        });

        app.get("/finish", function (req, res) {
            console.log("FINISH!");

            res.end("thx, phantomjs!");
        });
    });
});
