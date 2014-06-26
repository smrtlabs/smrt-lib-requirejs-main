(function (require) {
    "use strict";

    var ATTRIBUTE_SMRT_DATA_PREFIX = "data-smrt-",
        HTTP_STATUS_OK = 200,
        PATH_SEPARATOR = "/",
        REQUEST_READYSTATE_DONE = 4;

    /**
     * @param {String} path path from with username should be taken
     * @returns {String} path basename
     */
    function basename (path) {
        var pathChunks = path.split(PATH_SEPARATOR);

        pathChunks.pop();

        return pathChunks.join(PATH_SEPARATOR);
    }

    /**
     * @param {*} err object that caused an error
     * @returns {void}
     */
    function errorHandle (err) {
        console.error(err);
    }

    /**
     * @param {String} url build script url
     * @param {Function} cbSuccess function to be called on success
     * @param {Function} cbFailure function to be called on failure
     * @returns {void}
     */
    function loadBuildScript (url, cbSuccess, cbFailure) {
        if (url) {
            request(url, function (rq) {
                normalizeBuildString(url, rq.responseText, cbSuccess, cbFailure);
            }, cbFailure);
        } else {
            normalizeBuildObject(url, {}, cbSuccess, cbFailure);
        }
    }

    /**
     * @param {Function} cbSuccess function to be called on success
     * @param {Function} cbFailure function to be called on failure
     * @returns {void}
     */
    function loadEntryScriptElement (cbSuccess, cbFailure) {
        var found = false,
            i,
            script,
            scripts = document.scripts;

        for (i = 0; i < scripts.length; i += 1) {
            script = scripts.item(i);
            if (script.hasAttributes("data-main") && script.hasAttribute(nsAttribute("main"))) {
                found = true;
                cbSuccess(script, cbFailure);
            }
        }

        if (!found) {
            cbFailure(cbSuccess);
        }
    }

    /**
     * @param {Function} cbSuccess function to be called on success
     * @param {Function} cbFailure function to be called on failure
     * @returns {void}
     */
    function loadMainScript (cbSuccess, cbFailure) {
        loadEntryScriptElement(function (script, loadEntryScriptCbFailure) {
            var buildScriptUrl = script.getAttribute(nsAttribute("build"));

            loadBuildScript(buildScriptUrl, function (build, loadBuildScriptCbFailure) {
                var configuredRequire = require.config(build),
                    mainScriptUrl = script.getAttribute(nsAttribute("main"));

                configuredRequire([mainScriptUrl], cbSuccess, loadBuildScriptCbFailure);
            }, loadEntryScriptCbFailure);
        }, cbFailure);
    }

    /**
     * @param {String} url build script url
     * @param {Object} buildObject raw requested build object
     * @param {Function} cbSuccess function to be called on success
     * @param {Function} cbFailure function to be called on failure
     * @returns {void}
     */
    function normalizeBuildObject (url, buildObject, cbSuccess, cbFailure) {
        buildObject.baseUrl = [basename(url), buildObject.baseUrl].join(PATH_SEPARATOR);

        cbSuccess(buildObject, cbFailure);
    }

    /**
     * @param {String} url build script url
     * @param {String} buildString raw requested build file
     * @param {Function} cbSuccess function to be called on success
     * @param {Function} cbFailure function to be called on failure
     * @returns {void}
     */
    function normalizeBuildString (url, buildString, cbSuccess, cbFailure) {
        normalizeBuildObject(url, eval(buildString), cbSuccess, cbFailure);
    }

    /**
     * @param {String} name attribute name to be namespaced
     * @returns {String} final attribute name
     */
    function nsAttribute (name) {
        return ATTRIBUTE_SMRT_DATA_PREFIX + name;
    }

    /**
     * @param {Function} cb function to be encapsulated
     * @returns {Function} function that can be called only once
     */
    function once (cb) {
        var called = false;

        return function () {
            if (!called) {
                called = true;

                cb.apply(this, Array.prototype.slice.call(arguments));
            }
        };
    }

    /**
     * @param {String} url path to perform request
     * @param {Function} cbSuccess function to be called on success
     * @param {Function} cbFailure function to be called on failure
     * @returns {void}
     */
    function request (url, cbSuccess, cbFailure) {
        var cbDone,
            rq = new XMLHttpRequest();

        cbDone = once(function () {
            if (HTTP_STATUS_OK === rq.status) {
                cbSuccess(rq);
            } else {
                cbFailure(rq);
            }
        });

        rq.open("GET", url);
        // rq.setRequestHeader("Accept", "application/json");

        rq.onreadystatechange = function () {
            if (REQUEST_READYSTATE_DONE === rq.readyState) {
                cbDone();
            }
        };
        rq.onerror = cbDone;
        rq.onload = cbDone;

        rq.send();
    }

    loadMainScript(null, errorHandle);
}(window.require));
