/*
*   Plug.Js
*   http://andrewcourtice.github.io/plug.js
*   Copyright (c) 2016 Andrew Courtice
*
*   Promise Module
*
*   Released under the MIT licence
*/

(function () {

    var PROMISE_STATE = {
            pending: "pending",
            success: "success",
            error: "error",
            completed: "completed"
        },

        MESSAGE_WARNING = "Promise has already been completed. A promise cannot be resolved or rejected after completion.";

    function Deferred() {
        this.state = PROMISE_STATE.pending;
        this.callbacks = [];
        this.successArgs = null;
        this.errorArgs = null;
    }

    Deferred.prototype = (function () {

        function registerCallback(state, callback, args) {
            if (this.state === state || (state === PROMISE_STATE.completed && this.state !== PROMISE_STATE.pending)) {
                callback.apply(this, args);
            } else {
                this.callbacks.push({
                    callback: callback,
                    state: state
                });
            }
        }

        function success(callback) {
            registerCallback.call(this, PROMISE_STATE.success, callback, this.successArgs);
            return this;
        }

        function error(callback) {
            registerCallback.call(this, PROMISE_STATE.error, callback, this.errorArgs);
            return this;
        }

        function then(callback) {
            var args = this.successArgs || this.errorArgs;
            registerCallback.call(this, PROMISE_STATE.completed, callback, args);
            return this;
        }

        function invokeCallbacks(state, args) {
            for (var i = 0; i < this.callbacks.length; i++) {
                var callback = this.callbacks[i];

                if (callback.state === state || callback.state === PROMISE_STATE.completed) {
                    callback.callback.apply(this, args);
                }
            }
        }

        function resolve() {
            if (this.state !== PROMISE_STATE.pending) {
                console.warn(MESSAGE_WARNING);
                return;
            }

            this.state = PROMISE_STATE.success;
            this.successArgs = [].slice.call(arguments, 0);

            invokeCallbacks.call(this, this.state, this.successArgs);
        }

        function reject() {
            if (this.state !== PROMISE_STATE.pending) {
                console.warn(MESSAGE_WARNING);
                return;
            }

            this.state = PROMISE_STATE.error;
            this.errorArgs = [].slice.call(arguments, 0);

            invokeCallbacks.call(this, this.state, this.errorArgs);
        }

        return {
            success: success,
            error: error,
            then: then,
            resolve: resolve,
            reject: reject
        };

    })();

    function Promise() {

        this.defer = function() {
            return new Deferred();
        };

    }

    plug.singleton("promise", [ Promise ]);

})();
