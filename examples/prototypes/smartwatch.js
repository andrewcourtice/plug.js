(function() {

    /**
     * SmartWatch constructor
     */
    function SmartWatch(connectionsService) {
        this._connectionsService = connectionsService;
    }

    /**
     * SmartWatch prototype
     */
    SmartWatch.prototype = (function() {

        /**
         * A simple function to demonstrate prototype merging
         */
        function specificSmartwatchFunction() {

            /* Display some feedback */
            alert("Specific smartwatch function");
        }

        /* Return the prototype */
        return {
            specificSmartwatchFunction: specificSmartwatchFunction
        };

    })();

    /* Register the module with the current plug instance */
    /* Note the final array [ "watch", "smartDevice" ] */
    /* This instructs plug to merge the two named prototypes with the module's prototype */
    plug.transient("smartWatch", [ "connectionsService", SmartWatch ], [ "watch", "smartDevice" ]);

})();
