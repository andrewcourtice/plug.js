(function() {

    /**
     * Watch prototype
     *
     * @return {Object}
     */
    var watchPrototype = (function() {

        /**
         * Private method to get the time
         */
        function getTime() {
            var date = new Date(),
                hours = date.getHours(),
                minutes = date.getMinutes(),
                period = hours < 12 ? "AM" : "PM";

            return (hours > 12 ? hours - 12 : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + " " + period;
        }

        /**
         * Simple mock time display function
         */
        function displayTime() {
            var time = getTime();
            alert(time);
        }

        /**
         * Simple mock stopwatch function
         */
        function startStopwatch() {
            alert("Stopwatch Started");
        }

        /**
         * Simple mock stopwatch function
         */
        function stopStopwatch() {
            alert("Stopwatch Stopped");
        }

        /* Return the prototype */
        return {
            displayTime: displayTime,
            startStopwatch: startStopwatch,
            stopStopwatch: stopStopwatch
        };

    })();

    /* Register the prototype with the current plug instance */
    plug.from("watch", watchPrototype);

    /**
     * Smart Device prototype
     *
     * @return {Object}
     */
    var smartDevicePrototype = (function() {

        /**
         * Simple mock bluetooth function
         */
        function connectToBluetooth(device) {

            /* Call the connectToBluetooth method on the service module */
            this._connectionsService.connectToBluetooth(device);
        }

        /**
         * Simple mock wifi function
         */
        function connectToWifi(ssid, username, password) {

            /* Call the connectToWifi method on the service module */
            this._connectionsService.connectToWifi(ssid, username, password);
        }

        /**
         * Simple mock gps tracking function
         */
        function trackGps() {

            /* Call the trackGps method on the service module */
            this._connectionsService.trackGps();
        }

        /**
         * Simple mock charge function
         */
        function charge() {
            alert("Charging!");
        }

        /* Return the prototype */
        return {
            connectToBluetooth: connectToBluetooth,
            connectToWifi: connectToWifi,
            trackGps: trackGps,
            charge: charge
        };

    })();

    /* Register the prototype with the current plug instance */
    plug.from("smartDevice", smartDevicePrototype);

})();
