# Http Module

The http module is a module for performing simple http requests (*get, post, put, delete*).

## Usage

```javascript
plug.singleton("mainModule", [ "http", function (http) {

    var url = "http://api.example.com";

    http.get(url)
        .success(function(data) {
            ...
        }).error(function() {
            ...
        }).then(function() {
            ...
        });

    http.post( ... );
    http.put( ... );
    http.delete( ... );

} ]);
```
