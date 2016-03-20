/*
*   Plug.Js
*   http://andrewcourtice.github.io/plug.js
*   Copyright (c) 2016 Andrew Courtice
*
*   HTTP Module
*
*   Dependencies: Promise
*
*   Released under the MIT licence
*/

(function () {

    var HTTP_METHOD = {
            head: "HEAD",
            get: "GET",
            post: "POST",
            put: "PUT",
            delete: "DELETE"
        },

        SUCCESSFUL_HTTP_RESPONSES = [
            200,
            201,
            202,
            203,
            204,
            205,
            206
        ];

    function Http(promise) {

        function executeRequest(method, url, data) {
            var xhr = new XMLHttpRequest(),
                deferred = promise.defer();

            xhr.open(method, url);
            xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
            xhr.send(data);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (SUCCESSFUL_HTTP_RESPONSES.indexOf(xhr.status) > -1) {
                        var responseData = JSON.parse(xhr.responseText);
                        deferred.resolve(responseData, xhr.status);
                    } else {
                        deferred.reject(xhr.status);
                    }
                }
            };

            return deferred;
        }

        this.get = function(url, data) {
            return executeRequest(HTTP_METHOD.get, url, data);
        };

        this.post = function(url, data) {
            return executeRequest(HTTP_METHOD.post, url, data);
        };

        this.put = function(url, data) {
            return executeRequest(HTTP_METHOD.put, url, data);
        };

        this.delete = function(url, data) {
            return executeRequest(HTTP_METHOD.delete, url, data);
        };

    };

    plug.singleton("http", [ "promise", Http ]);

})();
