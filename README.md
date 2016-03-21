# Plug.js

Plug.js is a lightweight JavaScript dependency injection and object life-cycle management library. The purpose of Plug.js is to provide a flexible way to connect modules and share data between them without requiring a hard dependency on a framework or a steep learning curve.

With no dependencies on third-party libraries, Plug.js weighs in at just 5kb (minified).

Plug.js' dependency registration uses a familiar RequireJS/AngularJS style signature making it quick and easy for developers with all different levels of experience to get up and running.


**Table of Contents**

- [Plug.js](#plugjs)
	- [The Facts](#the-facts)
	- [Why use Plug.js?](#why-use-plugjs)
	- [Get Plugging](#get-plugging)
		- [Manual Installation](#manual-installation)
		- [Bower](#bower)
		- [Nuget](#nuget)
		- [Usage](#usage)
			- [Singleton](#singleton)
			- [Transient](#transient)
		- [Variables](#variables)
			- [Inject by Value](#inject-by-value)
			- [Inject by Reference](#inject-by-reference)
	- [Resolving Registrations](#resolving-registrations)
	- [Dependencies](#dependencies)
	- [Prototypes](#prototypes)
	- [Factories](#factories)
	- [Browser Compatibility](#browser-compatibility)


## The Facts

* Plug.js **is not** a module loader (*RequireJS*)
* Plug.js **is** a dependency injector
* Plug.js **is not** a full framework (*AngularJS*)
* Plug.js **is** an object lifecycle manager


## Why use Plug.js?

Plug.js is designed to encourage less dependencies on frameworks that are often packed with more features than required for most project situations. It's also designed to be simple for even the most novice developer. Finally, Plug.js is designed to be flexible - to fit around your project, not make your project fit around it. This decoupling allows developers to easily upgrade and/or swap technologies without redesigning the entire front-end architecture.  


## Get Plugging

### Manual Installation

Download the **Plug.js** file or **Plug.min.js** (*recommended*) file and include it in your page either in the `<head>` section or just before the closing tag of the `<body>` section.

### Bower
```
$ bower install Plug.js
```

### Nuget
```
PM> Install-Package Plug.js
```

### Usage

To use Plug.js it's as simple as registering modules and variables. By default Plug.js provides two type of lifecycle factories (*explained below*): **singleton** and **transient**. A singleton registration will ensure only a single instance of the registered module is ever resolved, while a transient registration will return a new instance of the module each time it is resolved.

```javascript
plug.singleton("moduleName", [ injectionSignature ], [ prototypes ])
```
**or**
```javascript
plug.transient("moduleName", [ injectionSignature ], [ prototypes ])
```

| Argument | Type | Example | Required |
| -------- | ---- | ------- | -------: |
| moduleName | String | `"resourceModule"` | true |
| injectionSignature | Array | `[ function () { ... } ]` **or** `[ "dependency", function(dependency) { ... } ]` | true |
| prototypes | String **or** Array[String] | [ "animalPrototype", "carPrototype" ] | false |


#### Singleton
```javascript
plug.singleton("singletonModule", [ function() {

    this.doSomething = function() {
        alert("Did Something!");
    };

} ]);
```

#### Transient
```javascript
plug.transient("transientModule", [ function() {

    this.doSomething = function() {
        alert("Did Something!");
    };

} ]);
```

**Note**: The `oMod` module is injected (as a singleton) into each plug instance. The `oMod` module allows you to perform various operations on objects such as cloning and extending.


### Variables

Plug.js allows you to inject variables into the module scope. There are two types of injection available for variables: inject by **value**, and inject by **reference**.

Injecting a variable by value will inform Plug.js to create a clone of the object before it is injected into a module (*only applicable to reference types eg. Object, Array, Function*).

Injecting a variable by reference will inform Plug.js to treat the object normally and inject the reference to the variable into the module (*JavaScript's default behaviour for reference types*).

**Note**: A locally scoped reference to the `window` and the `document` objects are injected into modules by default. You can use these locally scoped variables by simply declaring them as a dependency to your module. If you need to do a large number of operations on the DOM I recommend using the locally scoped `document` variable in your module. Using locally scoped variables from the global namespace has a significant performance benefit. Without going into too much detail, this is because the browser will look for variables in the local scope before propagating up the scope chain to the global namespace. Therefor, depending on how far down the call-stack your calling routine is, this can have a significant performance benefit.

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
**or**
```javascript
var fooBar = plug.resolve([ "module1", "module2", "value1", "module3" ])
```

Using the array method will return an object with each resolution as a property of the object, whereas the default string method will return the single resolution.


## Dependencies
When registering a module you can define any other modules or registered variables that should be injected into your module.

**Note**: *Dependencies must be registered* **before** *being referenced in another module.*

```javascript
plug.singleton("module1", [ function() {

    this.saySomething = function(message) {
        alert(message);
    };

} ]);

plug.singleton("module2", [ "module1", function(module1) {

    this.saySomethingOnOtherModule = function(message) {
        module1.saySomething(message);
    };

} ]);

var module2 = plug.resolve("module2");
module2.saySomethingOnOtherModule("Hello World!");
```

## Prototypes
Plug.js' prototype management allows you to automate your modules inheritance. By adding prototypes to Plug.js you can assign any number of prototypes to your module when registering it. When the module is resolved, it's prototype is extended with the prototypes you assign to it.

You can register a prototype on Plug.js using the `from` function.

`plug.from("prototypeName", prototype)`

| Argument | Type | Example | Required |
| -------- | ---- | ------- | -------: |
| prototypeName | String | `"prototypeName"` | true |
| prototype | Object | {} | true |

To visualize how this works consider this example:

let's assume you have a module called `smartWatch`. A smart watch can be considered both a **watch** and a **smart device**. A watch has behaviors such as *displaying the time*, *start stopwatch* and *stop stopwatch*. A smart device has behaviors such as *connecting to Bluetooth*, *connecting to Wi-Fi*, *GPS tracking* and *charging*. The `smartWatch` module would encompass all of these behaviors, but you may also have some other modules such as `analogueWatch`, `digitalWatch`, `mobilePhone` and `fitnessBand` so the **watch** and **smart device** behaviors would need to be reusable across all of these modules. This is where prototypes are useful. Prototypes allow your modules to inherit properties or functions. Plug.js allows your modules to inherit the properties or functions of any number of prototypes automatically.

The smart watch example described above is available as a demo app in the examples folder of this repository.


## Factories
A Plug.js factory allows you to customize how your modules get resolved. As outlined above, Plug.js provides two factories: singleton and transient. Your custom factory must expose a method called **getInstance**. The **getInstance** method takes two arguments: *moduleConstructor*, *args*. See below on how the arguments are used to manage module lifecycle.

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

## Browser Compatibility

| Browser | Version |
| -------- | ---- | ------- | -------: |
| Google Chrome | 7+ |
| Mozilla Firefox | 4+ |
| Opera | 11.6+ |
| Internet Explorer | 9+ |
| Apple Safari | 5.1+ |
