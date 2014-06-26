(function (require) {
    "use strict";

    function initializeScripts (configuredRequire, $, names, scripts, data, autoInit, cb) {
        var awaiting = 1,
            i,
            promise,
            script;

        function done () {
            awaiting -= 1;
            if (cb && awaiting < 1) {
                cb();
            }
        }

        for (i = 0; i < scripts.length; i += 1) {
            script = scripts[i];
            if (autoInit && ("function" === typeof script || "object" === typeof script) && "function" === typeof script.init) {
                promise = script.init(data);
                if (cb && promise && "function" === typeof promise.then) {
                    awaiting += 1;
                    promise.then(done);
                }
            }
        }

        done();
    }

    function removeCloaks (configuredRequire, $, names) {
        var CLOAK_NAME_SPLIT_PATTERN = /\s+/,
            $cloaked = $(document).find("[data-require-cloak-name]");

        if ($cloaked.length < 1) {
            return;
        }

        $cloaked.each(function () {
            var $this = $(this),
                cloakNames = $this.data("require-cloak-name");

            names = names.concat(cloakNames.split(CLOAK_NAME_SPLIT_PATTERN));
        });

        $.each(names, function (i, name) {
            var $filtered = $cloaked.filter("[data-require-cloak-name~='" + name + "']");

            if ($filtered.length < 1) {
                return;
            }

            $filtered.each(function (j, element) {
                var $element = $(element),
                    classes = $element.data("require-cloak-class"),
                    required = $element.data("require-cloak-name").split(CLOAK_NAME_SPLIT_PATTERN);

                $element.removeAttr("data-require-cloak-name");
                $element.removeAttr("data-require-cloak-class");

                if (!classes) {
                    classes = "require-cloak";
                }

                configuredRequire(required, function () {
                    initializeScripts(configuredRequire, $, required, Array.prototype.slice.call(arguments), null, false, function () {
                        $element.removeClass(classes);
                    });
                }, createHandler(required));
            });
        });
    }

    function loadScripts (configuredRequire, $, interval) {
        var $scripts = $(document).find("script[type='text/javascript+async']");

        $scripts.each(function () {
            var $this = $(this),
                data = $this.data();

            configuredRequire([data.src], function (plugin) {
                initializeScripts(configuredRequire, $, [data.src], [plugin], data, true);
            }, createHandler([data.src]));

            $this.remove();
        });

        setTimeout(function () {
            removeCloaks(configuredRequire, $, Object.keys(require.s.contexts._.defined));
            loadScripts(configuredRequire, $, interval);
        }, interval);
    }

    function errorHandler (deps, err) {
        var msg = "Error while trying to load modules [" + deps + "]:" + (err.stack || err.toString());

        if (console) {
            if (console.error) {
                console.error(msg);
            } else if (console.log) {
                console.log(msg);
            }
        }
    }

    function createHandler (deps) {
        return function (err) {
            errorHandler(deps, err);
        };
    }

    function bootstrap (configuredRequire, $) {
        var INTERVAL_LOAD_SCRIPTS = 500;

        function main() {
            var i;

            loadScripts(configuredRequire, $, INTERVAL_LOAD_SCRIPTS);
        }

        configuredRequire(["common"], main, createHandler(["common"]));
    }

    function getRequireConfig () {
        var baseUrl = "/",
            componentsUrl = baseUrl + "bower_components";

        return {
            "baseUrl": baseUrl,
            "paths": {
                "async": componentsUrl + "/requirejs-plugins/src/async",
                "cufon": componentsUrl + "/cufon/cufon",
                "css": componentsUrl + "/require-css/css.min",
                "domReady": componentsUrl + "/requirejs-domready/domReady",
                "es5-shim": componentsUrl + "/es5-shim/es5-shim.min",
                "es6-shim": componentsUrl + "/es6-shim/es6-shim",
                "eventEmitter/EventEmitter": componentsUrl + "/eventEmitter/EventEmitter.min",
                "eventie": componentsUrl + "/eventie",
                "gmaps": componentsUrl + "/gmaps/gmaps",
                "goog": componentsUrl + "/requirejs-plugins/src/goog",
                "halson": componentsUrl + "/halson/index",
                "hammerjs": componentsUrl + "/hammerjs/hammer.min",
                "history": componentsUrl + "/history.js/scripts/compressed/history",
                "history.html4": componentsUrl + "/history.js/scripts/compressed/history.html4",
                "jquery": componentsUrl + "/jquery/dist/jquery.min",
                "jquery.backgroundSize": componentsUrl + "/jquery.backgroundSize/jquery.backgroundSize",
                "jquery.browser": componentsUrl + "/jquery.browser/dist/jquery.browser",
                "jquery.bxslider": componentsUrl + "/bxslider-4-kallisto/jquery.bxslider.min",
                "jquery.center": componentsUrl + "/dreamerslab-jquery.center/jquery.center.min",
                "jquery.cookie": componentsUrl + "/jquery-cookie/jquery.cookie",
                "jquery.fileupload": componentsUrl + "/jquery-file-upload/js/jquery.fileupload",
                "jquery.flippy": componentsUrl + "/flippy/jquery.flippy.min",
                "jquery.hammerjs": componentsUrl + "/jquery-hammerjs/jquery.hammer.min",
                "jquery.history": componentsUrl + "/history.js/scripts/compressed/history.adapter.jquery",
                "jquery.iframe-transport": componentsUrl + "/jquery.iframe-transport/jquery.iframe-transport",
                "jquery.imagesLoaded": componentsUrl + "/imagesloaded/imagesloaded",
                "jquery.isInViewport": componentsUrl + "/isInViewport/lib/isInViewport.min",
                "jquery.isotope": componentsUrl + "/isotope/jquery.isotope.min",
                "jquery.jscrollpane": componentsUrl + "/jscrollpane/script/jquery.jscrollpane.min",
                "jquery.jsrender": componentsUrl + "/jsrender/jsrender.min",
                "jquery.jsviews": componentsUrl + "/jsviews/jsviews.min",
                "jquery.magnificPopup": componentsUrl + "/magnific-popup/dist/jquery.magnific-popup.min",
                "jquery.mousewheel": componentsUrl + "/jquery-mousewheel/jquery.mousewheel.min",
                "jquery.placeholder": componentsUrl + "/jquery-placeholder/jquery.placeholder",
                "jquery.scrollTo": componentsUrl + "/jquery.scrollTo/jquery.scrollTo.min",
                "jquery.smartresize": componentsUrl + "/jquery.smartresize/jquery.smartresize",
                "jquery.sticky": componentsUrl + "/sticky/jquery.sticky",
                "jquery.tooltipster": componentsUrl + "/tooltipster/js/jquery.tooltipster.min",
                "jquery.ui": componentsUrl + "/jquery-ui/ui/minified/jquery-ui.min",
                "jquery.ui.widget": componentsUrl + "/jquery-file-upload/js/vendor/jquery.ui.widget",
                "jquery.unobtrusive-ajax": componentsUrl + "/Microsoft.jQuery.Unobtrusive.Ajax/jquery.unobtrusive-ajax.min",
                "jquery.validation": componentsUrl + "/jquery.validation/dist/jquery.validate.min",
                "json": componentsUrl + "/requirejs-plugins/src/json",
                "json2": componentsUrl + "/json2/json2",
                "jwplayer": componentsUrl + "/jwplayer-mirror/jwplayer",
                "lodash": componentsUrl + "/lodash/dist/lodash.compat.min",
                "propertyParser": componentsUrl + "/requirejs-plugins/src/propertyParser",
                "q": componentsUrl + "/q/q",
                "rx": componentsUrl + "/rxjs/dist/rx.all.min",
                "text": componentsUrl + "/requirejs-plugins/lib/text",
                "underscore": componentsUrl + "/lodash/dist/lodash.compat.min",
                "vex": componentsUrl + "/vex/js/vex.min",
                "vex.dialog": componentsUrl + "/vex/js/vex.dialog.min"
            },
            "shim": {
                "es6-shim": ["es5-shim"],
                "gmaps": {
                    "deps": ["google.maps", "jquery"],
                    "exports": "GMaps"
                },
                "halson": {
                    "exports": "halson"
                },
                "history": ["jquery.history", "history.html4"],
                "history.html4": ["jquery.history"],
                "jquery.backgroundSize": ["jquery"],
                "jquery.browser": ["jquery"],
                "jquery.bxslider": ["jquery"],
                "jquery.fileupload": [
                    "jquery",
                    "jquery.iframe-transport",
                    "jquery.ui.widget"
                ],
                "jquery.hammerjs": ["hammerjs", "jquery"],
                "jquery.history": ["jquery"],
                "jquery.iframe-transport": ["jquery"],
                "jquery.imagesLoaded": ["jquery"],
                "jquery.inview": ["jquery"],
                "jquery.isotope": ["jquery"],
                "jquery.jscrollpane": ["jquery", "jquery.mousewheel"],
                "jquery.jsrender": ["jquery"],
                "jquery.jsviews": ["jquery", "jquery.jsrender"],
                "jquery.magnificPopup": [
                    "jquery",
                    "css!/magnificPopup.css"
                ],
                "jquery.mousewheel": ["jquery"],
                "jquery.placeholder": ["jquery"],
                "jquery.scrollTo": ["jquery"],
                "jquery.smartresize": ["jquery"],
                "jquery.sticky": ["jquery"],
                "jquery.ui": ["jquery"],
                "jquery.ui.widget": ["jquery.ui"],
                "jquery.unobtrusive-ajax": ["jquery"],
                "vex": [
                    "jquery",
                    "css!/vex.css"
                ],
                "vex.dialog": ["jquery"]
            }
        };
    }

    var configuredRequire = require.config(getRequireConfig());

    define("google.maps", ["goog!maps,3,other_params:[libraries=places]"]);
    define("google.maps.places", ["google.maps"]);

    configuredRequire(["jquery", "es5-shim", "json2"], function ($) {
        bootstrap(configuredRequire, $);
    }, createHandler(["jquery", "es5-shim", "json2"]));
}(window.require));
