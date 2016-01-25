# Plug.js

Plug.js is a lightweight JavaScript dependency injection and object life-cycle management library. The purpose of Plug.js is to provide a flexible way to connect modules and share data between them without requiring a hard dependency on a framework or a steep learning curve.

With no dependencies on third-party libraries, Plug.js weighs in at just 3kb (minified).

Plug.js' dependency registration uses a familiar RequireJS/AngularJS style signature making it quick and easy for developers with all different levels of experience to get up and running.


## The Facts

* Plug.js **is not** a module loader (*RequireJS*)
* Plug.js **is** a dependency injector
* Plug.js **is not** a full framework (*AngularJS*)
* Plug.js **is** an object lifecycle manager


## Why use Plug.js?

Plug.js is designed to encourage less dependencies on frameworks that are often packed with more features than required for most project situations. It's also designed to be simple for even the most novice developer. Finally, Plug.js is designed to be flexible - to fit around your project, not make your project fit around it. This decoupling allows developers to easily upgrade and/or swap technologies without redesigning the entire front-end architecture.  


## Get Plugging

First, download the Plug.js file or Plug.min.js (*recommended*) file and include it in your page either in the `<head>` section or just before the closing tag of the `<body>` section.

To use Plug.js it's as simple as registering modules and variables. By default Plug.js provides two type of lifecycle factories (*explained below*): **singleton** and **transient**. A singleton registration will only a single instance of the registered module is ever resolved, while a transient registration will return a new instance of the module each time it is resolved.

### Usage

`plug.singleton(moduleName, [ injectionSignature ], scope)`

| Argument | Type | Example | Required |
| -------- | ---- | ------- | -------: |
| moduleName | String | `"resourceModule"` | true |
| injectionSignature | Array | `[ function () { ... } ] **or** [ "childModule", function(childModule) { ... } ]` | true |
| scope | Object | `this` | false |

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

plug.customResolver("module1", [ function() {
    // Module code ...
} ]);
```
