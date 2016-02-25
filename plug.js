/*
*   Plug.Js
*   http://andrewcourtice.github.io/plug.js
*   Copyright (c) 2016 Andrew Courtice
*
*   Version 1.2.0
*
*   Released under the MIT licence
*/

;(function (window, document, undefined) {

    "use strict";

    var isArray = Array.isArray,

        /**
        * A Dictionary of regex patterns used to validate strings
        * @type {Object}
        */
        VALIDATION_RULES = {
            propertyName: /^[^a-zA-Z$_]+|[^a-zA-Z_0-9$]+/gi
        },

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
         * Method to construct new instances of objects
         *
         * @param  {Function} constructor The object's constructor
         * @param  {Array} args An array of arguments for the object
         * @return {Object}
         */
        construct = function (constructor, args) {

            function constructorWrapper() {
                return constructor.apply(this, args);
            }

            constructorWrapper.prototype = constructor.prototype;

            return new constructorWrapper();
        },

        /**
        * An object for storing default factories to be attached to the current plug instance
        *
        * @type {Object}
        */
        defaultFactories = {

            /* The default singleton factory */
            singleton: function () {

                /* A variable to store an instance of the module */
                var instance;

                /* Implement the required getInstance method */
                function getInstance (moduleConstructor, args) {

                    /* If there is no instance stored on the factory, get one */
                    if (!instance) {
                        instance = construct(moduleConstructor, args);
                    }

                    return instance;
                }

                /* Expose public methods */
                return {
                    getInstance: getInstance
                };

            },

            /* The default transient factory */
            transient: function () {

                /* Implement the required getInstance method */
                function getInstance (moduleConstructor, args) {
                    return construct(moduleConstructor, args);
                }

                /* Expose public methods */
                return {
                    getInstance: getInstance
                };

            }
        };

    /**
     * A helper module for performing object manipulation
     */
    function ObjectModifier () {};

    /**
     * A helper module for performing object manipulation
     */
    ObjectModifier.prototype = (function() {

        /**
        * A helper method to clone objects
        *
        * @private
        * @param  {Object} obj The object to be cloned
        * @param  {Boolean} deepClone A boolean to indicate whether the method should recurse through the object tree
        * @return {Object}
        */
        function cloneObject (obj, deepClone) {

            /* Make sure we're working with an object */
            if (typeof obj !== "object") {
                throw new Error("Value provided is not an object");
            }

            /* Define a base target object */
            var clonedObj = {};

            /* Add cloned properties to the target object and recurse if necessary */
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

            /* Make sure we're working with an array */
            if (!isArray(arr)) {
                throw new Error("Value provided is not an array");
            }

            /* Map the array to a new array and recurse if necessary */
            var clonedArr = arr.map(function (item) {
                return deepClone ? clone(item, deepClone) : item;
            });

            return clonedArr;
        }

        /**
        * A helper method to clone a function
        *
        * @param  {Function} func The function to be cloned
        * @return {Function}
        */
        function cloneFunction(func) {

            /* Make sure we're working with a function */
            if (typeof func !== "function") {
                throw new Error("Value provided is not a function");
            }

            return func.bind({});
        }

        /**
        * A method for cloning objects
        *
        * @param  {Object} obj The object to be cloned
        * @param  {Boolean} deepClone A boolean to indicate whether the method should recurse through the object tree
        * @return {Object}
        */
        function clone (obj, deepClone) {

            /* Default deep cloning to false */
            deepClone = deepClone || false;

            /* Test the object type and clone accordingly */
            var clonedObj = obj;
            switch (true) {
                case (obj instanceof Element && typeof obj === "object" && obj.nodeName):
                    clonedObj = obj.cloneNode(deepClone);
                    break;
                    case (obj instanceof Object || typeof obj === "object"):
                    clonedObj = cloneObject(obj, deepClone)
                    break;
                    case (obj instanceof Array || isArray(obj)):
                    clonedObj = cloneArray(obj, deepClone);
                    break;
                    case (obj instanceof Function || typeof obj === "function"):
                    clonedObj = cloneFunction(obj);
                    break;
                    case (obj instanceof Date):
                    clonedObj = new Date();
                    clonedObj.setTime(obj.getTime());
                    break;
                }

                return clonedObj;
            }

            /**
             * A method for merging two objects
             *
             * @param  {Object} targetObj The object to extend
             * @param  {Object} sourceObj The root object
             * @param  {Boolean} deepExtend Whether the extension should be recursive
             * @return {Object}
             */
            function merge (targetObj, sourceObj, deepExtend) {

                /* Defaul the target object */
                targetObj = targetObj || {};

                for (var prop in sourceObj) {

                    /* Check the property of the source object */
                    if (sourceObj.hasOwnProperty(prop)) {

                        /* If deep extend is enabled and the source property is an object, recurse */
                        if (deepExtend && typeof sourceObj[prop] === "object") {
                            targetObj[prop] = merge(targetObj[prop], sourceObj[prop], true);
                        } else {
                            targetObj[prop] = sourceObj[prop];
                        }
                    }
                }

                /* Return the extended object */
                return targetObj;
            }

            /**
             * A method for extending an object with multiple child objects
             * @param  {Object} obj The object to extend
             * @param  {Array|Object} extensions An array of objects to merge with the source object
             * @param  {Boolean} deepExtend Whether the extension should be recursive
             * @return {Object}
             */
            function extend (obj, extensions, deepExtend) {

                if (typeof obj !== "object") {
                    throw new Error("Only objects can be extended");
                }

                var extensionArray = [].concat(extensions);

                for (var i = 0; i < extensionArray.length; i++) {
                    var sourceObj = extensionArray[i];
                    merge(obj, sourceObj, deepExtend);
                }

                return obj;
            }

            /* Expose public methods */
            return {
                clone: clone,
                extend: extend
            };

    })();

    /**
     * A object for storing information about a registration
     *
     * @param {REGISTRATION_TYPE} type The type of registration this is
     * @param {Object} value The value to assign to the registration
     */
    function Registration (type, value) {
        this.type = type;
        this._value = value;
    };

    /**
     * A object for storing information about a registration
     */
    Registration.prototype = (function() {

        /**
         * Gets the value of a registration
         *
         * @return {Object}
         */
        function getValue() {
            var value = this._value;

            /* If it's a module call the getInstance method */
            if (this.type === REGISTRATION_TYPE.module) {
                value = this._value.getInstance();
            }

            return value;
        }

        return {
            getValue: getValue
        };

    })();

    /**
     * Register for maintaining injectables
     */
    function Register () {

        /**
         * [registrations description]
         * @type {Array}
         */
        this._registrations = {};

    };

    /**
     * Register for maintaining injectables
     */
    Register.prototype = (function() {

        /**
         * Checks to see if an object with the given name has been registered
         *
         * @private
         * @param  {String} name
         * @return {Boolean}
         */
        function isRegistered (name) {
            return (typeof this._registrations[name] !== "undefined");
        }

        /**
         * Add a new registration to the register
         *
         * @param {String} name The name of the registration
         * @param {REGISTRATION_TYPE} type The type of the registration
         * @param {Object} value The value of the registration
         */
        function addRegistration (name, type, value) {

            /* Check minimum requirements for a registration */
            if (typeof name === "undefined" || typeof type === "undefined") {
                throw new Error("Invalid registration");
            }

            this._registrations[name] = new Registration(type, value);
        }

        /**
         * Retrieve a registration
         *
         * @private
         * @param  {String} name The name of the registration
         * @return {Registration}
         */
        function getRegistration (name) {

            /* Make sure the name is valid */
            if (typeof name !== "string") {
                throw new Error("Invalid name provided");
            }

            return this._registrations[name];
        }

        /**
         * Retrieve a set of registrations
         *
         * @param  {Array} names An array of names to get registrations for
         * @return {Array}
         */
        function retrieveRegistrations (names) {

            /* Make sure the list of names is a valid array */
            if (!isArray(names)) {
                throw new Error("Must provide at least one name");
            }

            /* Resolve the registrations for the list of names provided */
            var resolutions = [];
            for (var i = 0; i < names.length; i++) {
                var resolution = getRegistration.call(this, names[i]);
                resolutions.push({ name: names[i], resolution: resolution });
            }

            return resolutions;
        }

        /* Expose public methods */
        return {
            add: addRegistration,
            retrieve: retrieveRegistrations
        };

    })();

    /**
     * An Object to store factories
     */
    function FactoryStore () {
        this._factories = {};
    };

    /**
     * An Object to store factories
     */
    FactoryStore.prototype = (function() {

        /**
         * Checks to see if a factory is registered
         *
         * @private
         * @param  {String} name The name of the factory
         * @return {Boolean}
         */
        function isRegistered (name) {
            return (typeof this._factories[name] !== "undefined");
        }

        /**
         * Adds a factory to the factory store
         *
         * @param {String} name The name of the factory to add to the factory store
         * @param {Function} factoryConstructor The constructor of the factory
         */
        function addFactory (name, factoryConstructor) {
            this._factories[name] = factoryConstructor;
        }

        /**
         * Gets a factory from the factory store
         *
         * @param  {[type]} name The name of the factory to retrieve
         * @return {Object}
         */
        function getFactory (name) {

            /* Make sure the factory is registered */
            if (isRegistered.call(this, name)) {
                var factory = new this._factories[name]();

                /* Make sure the factory has a getInstance method */
                if (typeof factory.getInstance === "undefined") {
                    throw new Error("Factory must contain a 'getInstance' method");
                }

                return factory;
            }
        }

        /* expose public methods */
        return {
            add: addFactory,
            retrieve: getFactory
        };

    })();

    function PrototypeStore () {
        this._prototypes = {};
    };

    PrototypeStore.prototype = (function () {

        /**
         * Checks to see if a prototype is registered
         *
         * @private
         * @param  {String} name The name of the prototype
         * @return {Boolean}
         */
        function isRegistered (name) {
            return (typeof this._prototypes[name] !== "undefined");
        }

        function addPrototype (name, prototype) {
            this._prototypes[name] = prototype;
        }

        function getPrototype (name) {

            if (!isRegistered.call(this, name)) {
                throw new Error("A prototype called " + name + " has not been registered");
            }

            return this._prototypes[name];
        }

        /**
         * Retrieve a set of prototypes
         *
         * @param  {Array} names An array of names to get registrations for
         * @return {Array}
         */
        function retrievePrototypes (names) {

            /* Make sure the list of names is a valid array */
            if (!isArray(names)) {
                throw new Error("Must provide at least one name");
            }

            /* Resolve the registrations for the list of names provided */
            var prototypes = [];
            for (var i = 0; i < names.length; i++) {
                var prototype = getPrototype.call(this, names[i]);
                prototypes.push(prototype);
            }

            return prototypes;
        }

        return {
            add: addPrototype,
            retrieve: retrievePrototypes
        };

    })();

    /**
     * An object for storing module properties and generating module instances
     *
     * @param {String} factoryName The name of the factory to be used to get an instance of this module
     * @param {Function} moduleConstructor The constructor method of the module
     * @param {Array} dependencies An array of registered dependencies required for this module
     */
    function Module (factory, moduleConstructor, dependencies) {
        this._factory = factory;
        this._moduleConstructor = moduleConstructor;
        this._dependencies = dependencies;
    }

    /**
     * An object for storing module properties and generating module instances
     */
    Module.prototype = (function () {

        /**
         * Method to get an instance of the current module using its assigned factory
         *
         * @return {Object}
         */
        function getInstance () {

            /* Map the dependencies and resolve any modules */
            var args = this._dependencies.map(function (dependency) {
                return dependency.resolution ? dependency.resolution.getValue() : undefined;
            });

            /* Call the getInstance method on the factory */
            return this._factory.getInstance(this._moduleConstructor, args);
        }

        /* Expose public methods */
        return {
            getInstance: getInstance
        };

    })();

    /**
     * Plug constructor
     */
    function Plug () {
        this._register = new Register();
        this._factoryStore = new FactoryStore();
        this._prototypeStore = new PrototypeStore();
        this._objectModifier = new ObjectModifier();
    }

    /**
     * Plug prototype
     */
    Plug.prototype = (function () {

        /**
         * An internal method for registering modules
         *
         * @private
         * @param  {String} moduleName
         * @param  {String} factoryName
         * @param  {Array} constructorArray
         * @return {Undefined}
         */
        function registerModule (moduleName, factoryName, constructorArray) {

            /* Check the module name */
            if (typeof moduleName === "undefined" || !isArray(constructorArray)) {
                throw new Error("Invalid module registration");
            }

            /* If the constructor array only has one item in it, make sure it is a function */
            if (constructorArray.length <= 1 && typeof constructorArray[0] !== "function") {
                throw new Error("Module registration requires a constructor function");
            }

            /* Get the constructor from the end of the array */
            var moduleConstructor = constructorArray.pop();

            /* Make sure the construction is a function */
            if (typeof moduleConstructor !== "function") {
                throw new Error("Last parameter of constructor array must be a constructor function");
            }

            /* Get the factory for this module */
            var factory = this._factoryStore.retrieve(factoryName);

            /* Get any dependencies for this module */
            var dependencies = this._register.retrieve(constructorArray);

            /* Create a new module object */
            var module = new Module(factory, moduleConstructor, dependencies);

            /* Register the module */
            this._register.add(moduleName, REGISTRATION_TYPE.module, module);

            /* Return the current plug instance for method chaining */
            return this;
        }

        /**
         * A method to register an object by value
         *
         * @param  {String} name The name of the registration
         * @param  {Object} value The value of the registration
         * @param  {Boolean} deepClone A boolean to indicate whether the method should recurse through the object tree
         * @return {Undefined}
         */
        function registerValue (name, value, deepClone) {
            var type = REGISTRATION_TYPE.injectable;
            var clonedValue = this._objectModifier.clone(value, deepClone);

            this._register.add(name, type, clonedValue);

            /* Return the current plug instance for method chaining */
            return this;
        }

        /**
         * A method to register an object by reference
         *
         * @param  {String} name The name of the registration
         * @param  {Object} value The value of the registration
         * @return {Undefined}
         */
        function registerReference (name, value) {
            var type = REGISTRATION_TYPE.injectable;
            this._register.add(name, type, value);

            /* Return the current plug instance for method chaining */
            return this;
        }

        /**
         * A method to register a custom factory
         *
         * @param  {String} factoryName The name of the factory to register
         * @param  {Function} factoryConstructor The factory to register
         * @return {Undefined}
         */
        function registerFactory (factoryName, factoryConstructor) {

            /* Check the factory name and the factory */
            if (typeof factoryName !== "string" || typeof factoryConstructor !== "function") {
                throw new Error("A valid factory must be supplied")
            }

            /* Cleanup the property name */
            var cleanFactoryName = factoryName.replace(VALIDATION_RULES.propertyName, "");

            /* Call the factory method and get it's return value */
            this._factoryStore.add(cleanFactoryName, factoryConstructor);

            /* Create a new factory method on the current instance for registering modules with this factory */
            this[cleanFactoryName] = function (moduleName, constructorArray) {
                registerModule.call(this, moduleName, cleanFactoryName, constructorArray);
                return this;
            }
        }

        /**
         * A method to register a prototype
         *
         * @param  {String} name The name of the prototype to register
         * @param  {Object} prototype The prototype to register
         * @return {Undefined}
         */
        function registerPrototype (name, prototype) {

            /* Check the prototype name and the prototype */
            if (typeof name !== "string" || typeof prototype !== "object") {
                throw new Error("A valid prototype must be supplied")
            }

            this._prototypeStore.add(name, prototype);

            return this;
        }

        /**
         * A method to resolve registered objects
         *
         * @param  {String|String[]} names The name(s) of objects to resolve
         * @return {Object}
         */
        function resolve (names) {

            /* Get the registered objects */
            var registrations = this._register.retrieve([].concat(names));

            /* If there is only one registration, invoke its value and return it */
            if (registrations.length == 1) return registrations[0].resolution.getValue();

            /* Otherwise loop through the registrations and attach them to an object */
            var resolution = {};
            for (var i = 0; i < registrations.length; i++) {
                var registration = registrations[i];

                /* If the resolution is undefined, skip it */
                if (typeof registration.resolution === "undefined") continue;

                resolution[registration.name] = registration.resolution.getValue();
            }

            return resolution;
        }

        /* Expose public methods */
        return {
            value: registerValue,
            reference: registerReference,
            factory: registerFactory,
            from: registerPrototype,
            resolve: resolve
        };

    })();

    /**
     * Method to create a new instance of plug
     *
     * @return {Plug}
     */
    function create () {

        /* Get a new instance of plug */
        var plug = new Plug();

        /* Attach the default factories to the current instance */
        for (var factoryName in defaultFactories) {
            plug.factory(factoryName, defaultFactories[factoryName]);
        }

        /* Inject references to the window and document objects */
        plug.reference("window", window)
            .reference("document", document)
            .singleton("objectModifier", ObjectModifier);

        return plug;
    }

    /* Add the create function to the plug prototype */
    Plug.prototype.create = create;

    /**
     * Method to initialize and expose an instance of plug
     *
     * @private
     * @return {Undefined}
     */
    function expose() {

        /* If plug is already in the global namespace and hasn't been overwritten, bail out */
        if (window.plug && window.plug instanceof Plug) {
            return;
        }

        var plug = create();

        /* Add the instance to the global namespace */
        window.plug = plug;
    }

    /* Initialize plug and expose it to the global namespace */
    expose();

})(window, document);
