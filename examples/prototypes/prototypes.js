(function() {

    var watchPrototype = (function() {

        function getTime() {
            var date = new Date(),
                hours = date.getHours(),
                minutes = date.getMinutes(),
                period = hours < 12 ? "AM" : "PM";

            return (hours > 12 ? hours - 12 : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + " " + period;
        }

        function displayTime() {
            var time = getTime();
            alert(time);
        }

        function startStopwatch() {
            alert("Stopwatch Started");
        }

        function stopStopwatch() {
            alert("Stopwatch Stopped");
        }

        return {
            displayTime: displayTime,
            startStopwatch: startStopwatch,
            stopStopwatch: stopStopwatch
        };

    })();

    plug.from("watch", watchPrototype);

    var smartDevicePrototype = (function() {

        function connectToBluetooth(device) {
            this._connectionsService.connectToBluetooth(device);
        }

        function connectToWifi(ssid, username, password) {
            this._connectionsService.connectToWifi(ssid, username, password);
        }

        function trackGps() {
            this._connectionsService.trackGps();
        }

        function charge() {
            alert("Charging!");
        }

        return {
            connectToBluetooth: connectToBluetooth,
            connectToWifi: connectToWifi,
            trackGps: trackGps,
            charge: charge
        };

    })();

    plug.from("smartDevice", smartDevicePrototype);

})();
