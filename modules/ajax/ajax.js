/*
*   Plug.Js
*   http://andrewcourtice.github.io/plug.js
*   Copyright (c) 2016 Andrew Courtice
*
*	Ajax Module
*
*   Released under the MIT licence
*/

(function() {

    var HTTP_METHODS = {
        head: "HEAD",
        get: "GET",
        post: "POST",
        put: "PUT",
        delete: "DELETE"
    };

    var Http = function () {

        function executeRequest (method, url, data, callback) {
            var xhr = new XMLHttpRequest();

            xhr.open(method, url);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            xhr.send(data);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {

                }
            };
        }

        function get (url, data, callback) {
            return executeRequest(HTTP_METHODS.get, url, data, callback);
        }

        function post (url, data, callback) {
            return executeRequest(HTTP_METHODS.post, url, data, callback);
        }

        function put (url, data, callback) {
            return executeRequest(HTTP_METHODS.put, url, data, callback);
        }

        function del (url, data, callback) {
            return executeRequest(HTTP_METHODS.delete, url, data, callback);
        }

        return {
            get: get,
            post: post,
            put: put,
            delete: del
        };

    };

    plug.singleton("http", Http);

})();
