(function() {

    function ConnectionsService() {}

    ConnectionsService.prototype = (function() {

        function connectToBluetooth(device) {
            alert("Connected to: " + device);
        }

        function connectToWifi(ssid, username, password) {
            alert("Connected to " + ssid + " as " + username);
        }

        function trackGps() {
            alert("Tracking your location");
        }

        return {
            connectToBluetooth: connectToBluetooth,
            connectToWifi: connectToWifi,
            trackGps: trackGps
        };

    })();

    plug.singleton("connectionsService", [ ConnectionsService ]);

})();
