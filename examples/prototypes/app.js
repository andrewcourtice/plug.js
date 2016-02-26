(function() {

    var doc = plug.resolve("document"),
        smartWatch = plug.resolve("smartWatch");

    doc.getElementById("time").addEventListener("click", function() {
        smartWatch.displayTime();
    });

    doc.getElementById("wifi").addEventListener("click", function() {
		var ssid = doc.getElementById("ssid").value,
			username = doc.getElementById("username").value;
        smartWatch.connectToWifi(ssid, username, "password");
    });

    doc.getElementById("bluetooth").addEventListener("click", function() {
		var device = doc.getElementById("device").value;
        smartWatch.connectToBluetooth(device);
    });

})();
