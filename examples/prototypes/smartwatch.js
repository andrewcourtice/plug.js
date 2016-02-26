(function() {

    function SmartWatch(connectionsService) {
        this._connectionsService = connectionsService;
    }

    SmartWatch.prototype = (function() {

        function specificSmartwatchFunction() {
            alert("Specific smartwatch function");
        }

        return {
            specificSmartwatchFunction: specificSmartwatchFunction
        };

    })();

    plug.transient("smartWatch", [ "connectionsService", SmartWatch ], [ "watch", "smartDevice" ]);

})();
