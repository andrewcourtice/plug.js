(function() {

    /* Resolve a local refernce to document and a smartwatch instance */
    /* Remember the smartWatch module was registered as transient, so a new instance will be created each time we resolve it */
    var doc = plug.resolve("document"),
        smartWatch = plug.resolve("smartWatch");

    /* Wire up some click events */

    doc.getElementById("time").addEventListener("click", function() {
        smartWatch.displayTime();
    });

    doc.getElementById("wifi").addEventListener("click", function() {

        /* Get user input */
		var ssid = doc.getElementById("ssid").value,
			username = doc.getElementById("username").value;

            /* In modern browsers that support HTML5, the standard validation should prevent empty input */
            /* However for older browsers we should always catch any validation exceptions that propogate from the service module */
            try {
                smartWatch.connectToWifi(ssid, username, "password");
            } catch (err) {

                /* Let the user know what happened */
                alert(err.message);
            }

    });

    doc.getElementById("bluetooth").addEventListener("click", function() {

        /* Get user input */
		var device = doc.getElementById("device").value;

        /* In modern browsers that support HTML5, the standard validation should prevent empty input */
        /* However for older browsers we should always catch any validation exceptions that propogate from the service module */
        try {
            smartWatch.connectToBluetooth(device);
        } catch (err) {

            /* Let the user know what happened */
            alert(err.message);
        }

    });

})();
