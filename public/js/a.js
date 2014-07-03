define(function () {
    var request = new XMLHttpRequest();

    request.open("GET", "/finish");
    request.onreadystatechange = function () {
        if (4 === request.readyState) {
            console.log("ALL OK");

            phantom.exit();
        }
    };

    request.send();
});
