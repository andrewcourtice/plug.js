(function() {

    var eventPrototype = (function() {

        var events = this.events = {};

        function on(eventName, callback) {

            if (typeof eventName !== "string" || typeof callback !== "function") {
                console.warn("Incorrect event registration. Event name must be a string and callback must be a function");
                return;
            }

            if (!events.hasOwnProperty(eventName)) {
                events[eventName] = [];
            }

            events[eventName].push(callback);
            console.dir(events);
        }

        function off(eventName, callback) {

            if (typeof eventName !== "string") {
                console.warn("Incorrect event registration. Event name must be a string.");
                return;
            }

            if (typeof callback === "undefined") {
                delete events[eventName];
            }

            var callbackIndex = events[eventName].indexOf(callback);
            events[eventName].splice(callbackIndex, 1);

            if (events[eventName].length === 0) {
                delete events[eventName];
            }
        }

        function emit() {
            var args = [].slice.call(arguments, 0),
                eventName = args.shift();

            if (typeof eventName !== "string" && !events.hasOwnProperty(eventName)) {
                return;
            }
            console.dir(events);
            var callbacks = events[eventName];

            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i].apply(this, args);
            }
        }

        return {
            on: on,
            off: off,
            emit: emit
        };

    })();

    plug.from("eventPrototype", eventPrototype);

})();
