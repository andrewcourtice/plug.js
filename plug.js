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

            /**
             * [registrations description]
             * @type {Array}
             */
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
             * @private
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

                // Resolve the registrations for the list of names provided
                var resolutions = [];
                for (var i = 0; i < names.length; i++) {
                    var resolution = getRegistration(names[i]);
                    resolutions.push(resolution);
                }

                return resolutions;
            }

            // Expose public methods
            return {
                add: addRegistration,
                retrieve: retrieveRegistrations
            };

        })();

        /**
         * Class for performing object manipulation
         *
         * @param  {Object}
         * @return {Object}
         */
        var objectModifier = (function() {

            /**
             * A helper method to clone objects
             *
             * @private
             * @param  {Object} obj The object to be cloned
             * @param  {Boolean} deepClone A boolean to indicate whether the method should recurse through the object tree
             * @return {Object}
             */
            function cloneObject (obj, deepClone) {

                // Make sure we're working with an object
                if (typeof obj !== "object") {
                    throw new Error("Value provided is not an object");
                }

                // Define a base target object
                var clonedObj = {};

                // Add cloned properties to the target object and recurse if necessary
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        clonedObj[prop] = deepClone ? clone(obj[prop], deepClone) : obj[prop];
                    }
                }

                return clonedObj;
            }

            /**
             * A helper method to clone an array
             *
             * @private
             * @param  {Array} arr The array to be cloned
             * @param  {Boolean} A boolean to indicate whether the method should recurse through the object tree
             * @return {Array}
             */
            function cloneArray(arr, deepClone) {

                // Make sure we're working with an array
                if (!isArray(arr)) {
                    throw new Error("Value provided is not an array");
                }

                // Map the array to a new array and recurse if necessary
                var clonedArr = arr.map(function (item) {
                    return clone(item, deepClone);
                });

                return clonedArr;
            }

            /**
             * A method for cloning objects
             *
             * @param  {Object} obj The object to be cloned
             * @param  {Boolean} deepClone A boolean to indicate whether the method should recurse through the object tree
             * @return {Object}
             */
            function clone (obj, deepClone) {

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

            // Expose public methods
            return {
                clone: clone
            };

        })();

        /**
         * An internal method for invoking registered values if necessary (ie. modules)
         *
         * @private
         * @param  {Registration} registration The registration storing the value to be invoked
         * @return {Object}
         */
        function invokeRegistration (registration) {
            var value = registration.value;

            /*
            If the registration is a module, call the getInstance method to get an instance
            of the module from its assigned factory
             */
            if (registration.type === REGISTRATION_TYPE.module) {
                return value.getInstance();
            }

            // Otherwise just return the value of the registration
            return value;
        }

        /**
         * A class for storing module properties and generating module instances
         *
         * @param {String} factoryName The name of the factory to be used to get an instance of this module
         * @param {Function} moduleConstructor The constructor method of the module
         * @param {Array} dependencies An array of registered dependencies required for this module
         * @param {Object} scope The execution context of the module
         */
        var Module = function (factoryName, moduleConstructor, dependencies, scope) {

            /**
             * A method to resolve the list of dependencies for this module
             *
             * @private
             * @return {Array}
             */
            function resolveDependencies() {

                // If there are no dependencies return an empty array
                if (typeof dependencies === "undefined") return [];

                // If the dependencies aren't an array throw an error
                if (!isArray(dependencies)) {
                    throw new Error("Dependencies must be an array");
                }

                // Map the dependencies
                var resolutions = dependencies.map(function (item) {
                    return invokeRegistration(item);
                });

                return resolutions;
            }

            /**
             * Internal method to get the factory for this module
             *
             * @private
             * @return {Object}
             */
            function getFactory() {

                // If the factory is registered then return it
                if (factories.hasOwnProperty(factoryName)) {
                    return factories[factoryName];
                }

                // If not, throw an error and stop control flow
                throw new Error("Factory " + factoryName + " is not registered");
            }

            /**
             * Method to get an instance of the current module using its assigned factory
             *
             * @return {Object}
             */
            function getInstance () {

                // Get the factory for this module
                var factory = getFactory();

                // Make sure the factory has a getInstance method
                if (typeof factory.getInstance === "undefined") {
                    throw new Error("Factory must contain a 'getInstance' method");
                }

                // Resolve any dependencies for this module
                var args = resolveDependencies();

                // Call the getInstance method on the factory
                return factory.getInstance(moduleConstructor, args, scope);
            }

            // Expose public methods
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
