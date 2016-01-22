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

## Dependencies
When registering a module you can define any other modules or registered varibles that should be injected into your module.

```javascript
plug.singleton("module1", [ function() { 

    function saySomething(message) {
        alert(message);
    }
    
    return {
        saySomething: saySomething
    };
} ]);

plug.singleton("module2", [ "module1", function(module1) {
    
    function saySomethingOnOtherModule(message) {
        module1.saySomething(message);
    }
    
    return {
        saySomethingOnOtherModule: saySomethingOnOtherModule
    };
    
} ]);

var module2 = plug.resolve("module2");
module2.saySomethingOnOtherModule("Hello World!");
```

## Factories
Plug.js' factories allow you to customize how your modules get resolved. By default Plug.js provides two factories: singleton and transient. Your custom factory must expose a method called **getInstance**. The **getInstance** method takes three arguments: moduleConstructor, args and scope. The moduleConstructor argument is the contructor function of the module which must be invoked and returned in the **getInstance** method. The args argument is an array of dependencies that have been resolved. 

```javascript
plug.factory("customResolver", function() {
    function getInstance(moduleConstructor, args, scope) {
        return moduleConstructor.apply(scope, args);
    }
    
    return {
        getInstance: getInstance
    }
});

plug.customResolver("module1", [ function() {} ]);
```


