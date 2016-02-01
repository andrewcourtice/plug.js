# Ajax Module

The ajax module is a module for performing simple ajax requests (*get, post, put, delete*).

## Usage

```javascript
plug.singleton("mainModule", [ "ajax", function (ajax) {

    var url = "http://api.example.com";

    ajax.get( ... );
    ajax.post( ... );
    ajax.put( ... );
    ajax.delete( ... );

} ]);
```
