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

To use Plug.js it's as simple as registering modules and variables. By default Plug.js provides two type of lifecycle factories (*explained below*): **singleton** and **transient**. A singleton registration will ensure only a single instance of the registered module is ever resolved, while a transient registration will return a new instance of the module each time it is resolved.

### Usage

`plug.singleton("moduleName", [ injectionSignature ], scope)`

| Argument | Type | Example | Required |
| -------- | ---- | ------- | -------: |
| moduleName | String | `"resourceModule"` | true |
| injectionSignature | Array | `[ function () { ... } ]` **or** `[ "childModule", function(childModule) { ... } ]` | true |


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

### Variables

Plug.js allows you to inject variables into the module scope. There are two types of injection available for variables: inject by **value**, and inject by **reference**.

Injecting a variable by value will inform Plug.js to create a clone of the object before it is injected into a module (*only applicable to reference types eg. Object, Array, Function*).

Injecting a variable by reference will inform Plug.js to treat the object normally and inject the reference to the variable into the module (*JavaScript's default behaviour for reference types*).

**Note**: A locally scoped reference to the `window` and the `document` objects are injected into modules by default. You can use these locally scoped variables by simply declaring them as a dependency to your module.

#### Inject by Value

`plug.value("variableName", value, deepClone)`

| Argument | Type | Example | Required |
| -------- | ---- | ------- | -------: |
| variableName | String | `"customResolver"` | true |
| value | Object | {} | true |
| deepClone | Boolean | true | false |

```javascript

(function() {

    /* Simple value types */
    var foo = "Hello World",
        bar = 7;

    /* Complex reference type */
    var complexType = {
        foo: [
            { a: new Date(), b: "test 1" },
            { a: new Date(), b: "test 2" },
            { a: new Date(), c: "test 3" }
        ],
        bar: {
            a: function() {
                alert("foo bar");
            },
            b: {
                a: function() {
                    alert("another foo bar");
                }
            }
        }    
    };

    /* Inject the values */
    plug.value("foo", foo);
    plug.value("bar", bar);

    /* alternatively, use method chaining: plug.value(...).value(...).reference(...); */

    /* Deep clone */
    plug.value("complexType", complexType, true);
    /* When complexType is resolved it will be a new instance in each resolution. In other words complexType1.foo !== complexType2.foo */
    /* Modifying values on complexType1 has no effect on complexType2 */
})();

```

#### Inject by Reference

`plug.reference("variableName", value, deepClone)`

| Argument | Type | Example | Required |
| -------- | ---- | ------- | -------: |
| variableName | String | `"customResolver"` | true |
| value | Object | {} | true |

```javascript

(function() {

    /* Simple value types */
    var foo = "Hello World",
        bar = 7;

    /* Complex reference type */
    var complexType = {
        foo: [
            { a: new Date(), b: "test 1" },
            { a: new Date(), b: "test 2" },
            { a: new Date(), c: "test 3" }
        ],
        bar: {
            a: function() {
                alert("foo bar");
            },
            b: {
                a: function() {
                    alert("another foo bar");
                }
            }
        }    
    };

    /* Inject the values */
    plug.reference("foo", foo);
    plug.reference("bar", bar);

    /* alternatively, use method chaining: plug.value(...).value(...).reference(...); */

    /* Deep clone */
    plug.reference("complexType", complexType, true);
    /* When complexType is resolved it will be the same instance in each resolution. In other words complexType1.foo === complexType2.foo */
    /* Modifying values on complexType1 changes values on complexType2 because they are the same object */
})();

```

## Resolving Registrations
Plug.js uses a single method to resolve registered objects outside the context of a module constructor.

```javascript
var fooBar = plug.resolve("moduleOrVariableName")
```
or
```javascript
var fooBar = plug.resolve([ "module1", "module2", "value1", "module3" ])
```

Using the array method will return an object with each resolution as a property of the object, whereas the default string method will return the single resolution.


## Dependencies
When registering a module you can define any other modules or registered variables that should be injected into your module.

**Note**: *Dependencies must be registered* **before** *being referenced in another module.*

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
A Plug.js factory allow you to customize how your modules get resolved. As outlined above Plug.js provides two factories: singleton and transient. Your custom factory must expose a method called **getInstance**. The **getInstance** method takes three arguments: *moduleConstructor*, *args* and *scope*. See below on how the arguments are used to manage module lifecycle.

`plug.factory("factoryName", factoryConstructor)`

| Argument | Type | Example | Required |
| -------- | ---- | ------- | -------: |
| factoryName | String | `"customResolver"` | true |
| factoryConstructor | Function | `function () { ... }` | true |


`function getInstance(moduleConstructor, args) { ... }`

| Argument | Type | Required |
| -------- | ---- | -------: |
| moduleConstructor | Function | true |
| args | Array | true |


```javascript
plug.factory("customResolver", function() {

    /* The following is an excerpt from the Plug.js singleton factory source code */

    /* A variable to store an instance of the module */
    var instance;

     /* Implement the required getInstance method */
    function getInstance (moduleConstructor, args) {

        if (!instance) {
            instance = moduleConstructor.apply(null, args);
        }

        return instance;
    }

    /* Expose public methods */
    return {
        getInstance: getInstance
    };

});

plug.customResolver("module1", [ function() {
    /* ... */
} ]);
```
