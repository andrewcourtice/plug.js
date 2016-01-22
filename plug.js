/*
MIT Licence
Copyright (c) 2016 Andrew Courtice

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to
do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

;(function (window, document, undefined) {

    "use strict";

    var Plug = function() {

        var self = this,
            isArray = Array.isArray,

            // Enumeration for storing registration types
            REGISTRATION_TYPE = {
                module: 1,
                injectable: 2
            },

            // Enumeration for storing module types
            MODULE_TYPE = {
                singleton: 1,
                transient: 2
            };

        // Registration object for storing registered injectables
        var Registration = function (name, type, value) {
            return {
                name: name,
                type: type,
                value: value
            };
        };

        // Register for maintaining injectables
        var register = (function() {

            var registrations = [];

            function isRegistered (name) {
                for (var i = 0; i < registrations.length; i++) {
                    return registrations[i].name === name;
                }
            }

            function updateRegistration (name, value) {
                for (var i = 0; i < registrations.length; i++) {
                    var registration = registrations[i];
                    if (registration.name === name) registration.value = value;
                    break;
                }
            }

            function addRegistration (name, type, value) {
                if (name === undefined || type === undefined) {
                    throw new Error("Invalid registration");
                }

                if (isRegistered(name)) {
                    updateRegistration(name, value);
                }

                registrations.push(new Registration(name, type, value));
            }

            function getRegistration (name) {

                if (!name || typeof name != "string") {
                    console.warn("Invalid name provided");
                    return undefined;
                }

                for (var i = 0; i < registrations.length; i++) {
                    var registration = registrations[i];
                    if (registration.name === name) return registration;
                }
                console.warn("Failed to resolve " + name + ". Expect undefined for mapped variable.");
            }

            function retrieveRegistrations (names) {

                if (names === undefined || !isArray(names)) {
                    throw new Error("Must provide at least one name");
                }

                var resolutions = [];
                for (var i = 0; i < names.length; i++) {
                    var resolution = getRegistration(names[i]);
                    resolutions.push(resolution);
                }
                return resolutions;
            }

            return {
                add: addRegistration,
                retrieve: retrieveRegistrations
            };

        })();

        var objectModifier = (function() {

            function cloneObject (obj, deepClone) {

                if (typeof obj != "object") {
                    throw new Error("Not an object");
                }

                var clonedObj = {};
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        clonedObj[prop] = deepClone ? clone(obj[prop], deepClone) : obj[prop];
                    }
                }
                return clonedObj;
            }

            function cloneArray(arr, deepClone) {

                if (!isArray(arr)) {
                    throw new Error("Not an array");
                }

                var clonedArr = [];
                for (var i = 0; i < arr.length; i++) {
                    clonedArr[i] = deepClone ? clone(arr[i], deepClone) : arr[i];
                }
                return clonedArr;
            }

            function clone (obj, deepClone) {

                if (obj === undefined) return obj;

                deepClone = deepClone || false;

                var clonedObj = obj;
                switch (true) {
                    case (obj instanceof Object || typeof obj === "object"):
                        clonedObj = cloneObject(obj, deepClone)
                        break;
                    case (obj instanceof Array || isArray(obj)):
                        clonedObj = cloneArray(obj, deepClone);
                        break;
                    case (obj instanceof Date):
                        clonedObj = new Date();
                        clonedObj.setTime(obj.getTime());
                        break;
                }
                return clonedObj;
            }

            return {
                clone: clone
            };

        })();

        function invokeRegistration (registration) {

            if (registration.type === REGISTRATION_TYPE.module) {
                return registration.value.getInstance();
            }

            return registration.value;
        }

        var Module = function (type, constructorFunction, dependencies, scope) {

            function resolveDependencies() {
                var resolutions = [];
                if (dependencies !== undefined && isArray(dependencies)) {
                    var registrations = Register.retrieve(dependencies);
                    for (var i = 0; i < registrations.length; i++) {
                        var registration = registrations[i];
                        resolutions.push(invokeRegistration(registration));
                    }
                }
                return resolutions;
            };

            function createInstance() {
                var args = resolveDependencies();
                return constructorFunction.apply(scope, args);
            };

            var instance;
            var getInstance = function () {
                if (type === MODULE_TYPE.transient) {
                    return createInstance();
                }

                if (instance === undefined) {
                    instance = createInstance();
                }
                return instance;
            };

            return {
                type: type,
                getInstance: getInstance
            };
        };

        function registerModule (name, type, constructorArray, scope) {

            if (name === undefined || !isArray(constructorArray)) {
                throw new Error("Invalid singleton registration");
            }

            if (constructorArray.length < 1) {
                throw new Error("Module registration requires a constructor function");
            }

            var constructorFunction = constructorArray.pop();

            if (typeof constructorFunction !== "function") {
                throw new Error("Last parameter of constructor array must be a constructor function");
            }

            scope = scope || self;

            var module = new Module(type, constructorFunction, constructorArray, scope);

            register.add(name, REGISTRATION_TYPE.module, module);
        }

        function registerValue (name, value, deepClone) {
            var type = REGISTRATION_TYPE.injectable;
            register.add(name, type, ObjectModifier.clone(value, deepClone));
        }

        function registerReference (name, value) {
            var type = REGISTRATION_TYPE.injectable;
            register.add(name, type, value);
        }

        function registerSingleton (name, constructorArray, scope) {
            registerModule(name, MODULE_TYPE.singleton, constructorArray, scope);
        }

        function registerTransient (name, constructorArray, scope) {
            registerModule(name, MODULE_TYPE.transient, constructorArray, scope);
        }

        function resolve (names) {

            var registrations = Register.retrieve([].concat(names));

            if (registrations.length == 1) return invokeRegistration(registrations[0]);

            var resolution = {};
            for (var i = 0; i < registrations.length; i++) {
                var registration = registrations[i];

                if (registration === undefined) continue;

                resolution[registration.name] = invokeRegistration(registration);
            }
            return resolution;
        }

        function ready (callback) {

             if (callback === undefined || typeof callback != "function") {
                 throw new Error("Callback is not a function!");
             }

             window.onload = function() {
                 callback.call(self);
             };
        };

        function init () {
            registerReference("window", window);
            registerReference("document", document);
        };

        init();

        return {
            ready: ready,
            value: registerValue,
            reference: registerReference,
            singleton: registerSingleton,
            transient: registerTransient,
            resolve: resolve
        };

    };

    function expose() {
        window.plug = new Plug();
    }

    expose();

})(window, document);
