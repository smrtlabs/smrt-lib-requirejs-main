/**
 * @license Copyright (c) 2014, smrt.labs
 * For licensing, see LICENSE
 */

"use strict";

var cached = require("gulp-cached"),
    esformatter = require("gulp-esformatter"),
    eslint = require("gulp-eslint"),
    fs = require("fs"),
    gulp = require("gulp"),
    istanbul = require("gulp-istanbul"),
    mocha = require("gulp-mocha"),
    path = require("path"),
    rjs = require("gulp-r");

/*eslint no-sync: 0 */

global.configs = {
    get "esformatter"() {
        return JSON.parse(fs.readFileSync(global.paths.configs.esformatter));
    },

    get "eslintrc"() {
        return JSON.parse(fs.readFileSync(global.paths.configs.eslintrc));
    }
};

global.paths = {
    get "all"() {
        return [
            this.gulpfile,
            this.libs.files,
            this.tests.files
        ];
    },
    "configs": {
        "esformatter": path.join(__dirname, ".esformatter"),
        "eslintrc": path.join(__dirname, ".eslintrc")
    },
    "coverage": {
        "root": path.join(__dirname, "/node_coverage")
    },
    "gulpfile": __filename,
    "libs": {
        "files": path.join(__dirname, "/*-lib-*/**/*.js")
    },
    "tests": {
        "files": path.join(__dirname, "/*-lib-*/**/*test.js")
    },
    "root": __dirname
};

gulp.task("beautify", function () {
    gulp.src(global.paths.all)
        .pipe(cached("beautifying"))
        .pipe(esformatter(global.configs.esformatter))
        .pipe(gulp.dest(global.paths.root));
});

gulp.task("cover", function (done) {
    gulp.src(global.paths.libs.files)
        .pipe(require("gulp-debug")())
        .pipe(istanbul())
        .on("end", function () {
            gulp.src(global.paths.tests.files)
                .pipe(mocha())
                .pipe(istanbul.writeReports(global.paths.coverage.root))
                .on("end", done);
            });
});

gulp.task("lint", ["beautify"], function () {
    gulp.src(global.paths.all)
        .pipe(eslint(global.configs.eslintrc))
        .pipe(eslint.format());
});

gulp.task("minify", function () {
    gulp.src("public/js/*.js")
        .pipe(rjs({
            "baseUrl": "public/js"
        }))
        .pipe(gulp.dest("dist"));
});

gulp.task("test", ["lint"], function () {
    gulp.src(global.paths.tests.files).pipe(mocha({
        "reporter": "tap"
    }));
});

gulp.task("watch", function () {
    gulp.src(global.paths.all).pipe(cached("beautifying"));
    gulp.watch(global.paths.all, ["default"]);
});

gulp.task("default", ["beautify", "lint", "test"]);
