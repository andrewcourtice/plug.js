# Plug.js

Plug JS is a lightweight JavaScript dependency injection and object life-cycle management library. The purpose of Plug.js is to provide a flexible way to wire up modules. With no dependencies on third-party libraries, Plug.js weighs in at just 3kb (minified). Plug.js's dependency registration uses a familiar AngularJS style signature.


## Getting Started

To use Plug.js it's as simple as registering modules as either singleton or transient. A singleton registration will enforce a single instance of the registered module when resolved, while a transient registration will call the module's constructor each time the module is resolved.

#### Singleton
```javascript
plug.singleton("singletonModule", [ function() {

    function doSomething() {
        alert("Did Something!");
    }

    return {
        doSomething: doSomething
    };

} ]);
```

#### Transient
```javascript
plug.transient("transientModule", [ function() {

    function doSomething() {
        alert("Did Something!");
    }

    return {
        doSomething: doSomething
    };

} ]);
```

