(function() {

    /**
     * ConnectionsService constructor
     */
    function ConnectionsService() {}

    /**
     * ConnectionsService prototype
     */
    ConnectionsService.prototype = (function() {

        /**
         * Simple mock bluetooth function
         */
        function connectToBluetooth(device) {

            /* Make sure a device name is entered and throw an error if not */
            if (!device) {
                throw new Error("Please enter a Device Name");
            }

            /* Display some feedback */
            alert("Connected to: " + device);
        }

        /**
         * Simple mock wifi function
         */
        function connectToWifi(ssid, username, password) {

            /* Make sure a network name and username is entered and throw an error if not */
            if (!(ssid && username)) {
                throw new Error("Please enter both a Network Name and a Username");
            }

            /* Display some feedback */
            alert("Connected to " + ssid + " as " + username);
        }

        /**
         * Simple mock gps tracking function
         */
        function trackGps() {
            alert("Tracking your location");
        }

        /* Return the prototype */
        return {
            connectToBluetooth: connectToBluetooth,
            connectToWifi: connectToWifi,
            trackGps: trackGps
        };

    })();

    /* Register the connectionsService module with the current plug instance */
    plug.singleton("connectionsService", [ ConnectionsService ]);

})();
