# Promise module

The promise module is for creating simple promises for async operations.

## Usage

```javascript
plug.singleton("parentModule", [ "promise", function (promise) {

    this.setupEvent = function() {

        var element = document.getElementById("some-element");

        /* Get a new promise */
        var deferred = promise.defer();

        /* Set up an event listener */
        element.addEventListener("click", function(e) {

            /* Resolve the promise */
            deferred.resolve(e.target);

            /* OR */
            /* deferred.reject(e.target); */
        });

        /* Return the promise */
        return deferred;
    };

} ]);

plug.singleton("childModule", [ "parentModule", function (parentModule) {

    /* React to the promise outcome */
    parentModule.setupEvent()

        /* Successfully resolved */
        .success(function(target) {
            alert("Successfully resolved!");
        })

        /* Promise was rejected */
        .error(function(target) {
            alert("Failed to resolve!");
        })

        /* Promise was either resolved or rejected. Called regardless. */
        .then(function(target) {
            alert("Called regardless of promise outcome!");
        });

} ]);
```
