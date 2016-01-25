/*
*   Plug.Js
*   Copyright (c) 2016 Andrew Courtice
*   
*   Version 0.1.4
*   
*   Released under the MIT licence
*/

;(function (window, document, undefined) {

    "use strict";

    var Plug = function() {

        var self = this,
            isArray = Array.isArray,

            /**
             * An 'enumeration' of registration types
             * 
             * @type {Object}
             */
            REGISTRATION_TYPE = {
                module: 1,
                injectable: 2
            },

            /**
             * An object to store references to registered factories
             * @type {Object}
             */
            factories = {};

        /**
         * A 'class' for storing information about a registration
         * 
         * @param {String} name
         * @param {REGISTRATION_TYPE} type
         * @param {Object} value
         */
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

            /**
             * Checks to see if an object with the given name has been registered
             *
             * @private
             * @param  {String} name
             * @return {Boolean}
             */
            function isRegistered (name) {
                for (var i = 0; i < registrations.length; i++) {
                    return registrations[i].name === name;
                }
            }

            /**
             * Update the value of an exisiting registration
             *
             * @private
             * @param  {String} name
             * @param  {Object} value
             */
            function updateRegistration (name, value) {
                for (var i = 0; i < registrations.length; i++) {
                    var registration = registrations[i];
                    if (registration.name === name) registration.value = value;
                    break;
                }
            }

            /**
             * Add a new registration to the register
             * 
             * @param {String} name The name of the registration
             * @param {REGISTRATION_TYPE} type The type of the registration
             * @param {Object} value The value of the registration
             */
            function addRegistration (name, type, value) {

                // Check minimum requirements for a registration
                if (typeof name === "undefined" || typeof type === "undefined") {
                    throw new Error("Invalid registration");
                }

                // If it's already registered, update the value of the registration
                if (isRegistered(name)) {
                    updateRegistration(name, value);
                    return;
                }

                // Add it to the list of registrations
                registrations.push(new Registration(name, type, value));
            }

            /**
             * Retrieve a registration
             * 
             * @param  {String} name The name of the registration
             * @return {Registration}
             */
            function getRegistration (name) {

                // Make sure the name is valid
                if (!name || typeof name !== "string") {
                    throw new Error("Invalid name provided");
                }

                // Find the registration
                for (var i = 0; i < registrations.length; i++) {
                    var registration = registrations[i];
                    if (registration.name === name) return registration;
                }

                // At this point the name failed to be resolved. Warn the user.
                console.warn("Failed to resolve " + name + ". Expect undefined for mapped variable.");
            }

            /**
             * Retrieve a set of registrations
             * 
             * @param  {Array} names An array of names to get registrations for
             * @return {Array} 
             */
            function retrieveRegistrations (names) {

                // Make sure the list of names is not undefined and is a valid array
                if (typeof names === "undefined" || !isArray(names)) {
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

                if (typeof obj !== "object") {
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

                if (typeof obj === "undefined") return obj;

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

        var Module = function (factoryName, moduleConstructor, dependencies, scope) {

            function resolveDependencies() {
                var resolutions = [];
                if (typeof dependencies !== "undefined" && isArray(dependencies)) {
                    var registrations = register.retrieve(dependencies);
                    for (var i = 0; i < registrations.length; i++) {
                        var registration = registrations[i];
                        resolutions.push(invokeRegistration(registration));
                    }
                }
                return resolutions;
            }

            function getFactory() {
                if (factories.hasOwnProperty(factoryName)) {

                    return factories[factoryName];
                }
            }

            function getInstance () {

                var factory = getFactory();

                if (typeof factory.getInstance === "undefined") {
                    throw new Error("Factory must contain a 'getInstance' method");
                }
                var args = resolveDependencies();
                return factory.getInstance(moduleConstructor, args, scope);
            }

            return {
                getInstance: getInstance
            };
        };

        function registerModule (moduleName, factoryName, constructorArray, scope) {

            if (typeof moduleName === "undefined" || !isArray(constructorArray)) {
                throw new Error("Invalid module registration");
            }

            if (constructorArray.length < 1) {
                throw new Error("Module registration requires a constructor function");
            }

            var moduleConstructor = constructorArray.pop();

            if (typeof moduleConstructor !== "function") {
                throw new Error("Last parameter of constructor array must be a constructor function");
            }

            scope = scope || self;

            var module = new Module(factoryName, moduleConstructor, constructorArray, scope);

            register.add(moduleName, REGISTRATION_TYPE.module, module);
        }

        function registerValue (name, value, deepClone) {
            var type = REGISTRATION_TYPE.injectable;
            register.add(name, type, ObjectModifier.clone(value, deepClone));
        }

        function registerReference (name, value) {
            var type = REGISTRATION_TYPE.injectable;
            register.add(name, type, value);
        }

        function registerFactory (factoryName, factory) {

            if (typeof factoryName === "undefined" || typeof factory !== "function") {
                throw new Error("A valid factory must be supplied")
            }

            factories[factoryName] = factory.call();
            this[factoryName] = function(moduleName, constructorArray, scope) {
                registerModule(moduleName, factoryName, constructorArray, scope);
            }
        }

        function resolve (names) {

            var registrations = register.retrieve([].concat(names));

            if (registrations.length == 1) return invokeRegistration(registrations[0]);

            var resolution = {};
            for (var i = 0; i < registrations.length; i++) {
                var registration = registrations[i];

                if (registration === undefined) continue;

                resolution[registration.name] = invokeRegistration(registration);
            }
            return resolution;
        }

        return {
            value: registerValue,
            reference: registerReference,
            factory: registerFactory,
            resolve: resolve
        };

    };

    var defaultFactories = {
        singleton: function () {

            var instance;
            function getInstance (moduleConstructor, args, scope) {
                if (instance === undefined) {
                    instance = moduleConstructor.apply(scope, args);
                }
                return instance;
            }

            return {
                getInstance: getInstance
            };
        },

        transient: function () {

            function getInstance (moduleConstructor, args, scope) {
                args.unshift(scope);
                return new (Function.prototype.bind.apply(moduleConstructor, args));
            }

            return {
                getInstance: getInstance
            };
        }
    }



    function expose() {
        if (window.plug && window.plug instanceof Plug) {
            return;
        }

        var plug = new Plug();

        for (var factoryName in defaultFactories) {
            plug.factory(factoryName, defaultFactories[factoryName]);
        }

        plug.reference("window", window);
        plug.reference("document", document);

        window.plug = plug;
    }

    expose();

})(window, document);
