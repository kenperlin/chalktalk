"use strict"

var Atypical = (function () {
   var AT = {};

   // This internal variable holds all of our types, with keys being their names and values
   // being their constructors.
   var _types = {};

   // This internal variable will hold all our conversion functions, in the following structure:
   // {
   //     typename_converted_from: {
   //         typename_converted_to_1: function(value) {...}
   //         typename_converted_to_2: function(value) {...}
   //         ...
   //     }
   //     ...
   // }
   var _conversions = {};

   // Base for all types. Contains some common functionality needed in all of them.
   AT.Type = function() {};
   AT.Type.prototype = {
      // Converts this object to another type, returning the converted object or undefined
      // if no conversion exists.
      //
      // typename: Name of the destination type. Must be a type name that's already been
      //           defined.
      convert: function(typename) {
         if (!AT.typeIsDefined(typename)) {
            console.error("Type " + typename + " not defined.");
            return undefined;
         }
         if (typename == this.typename) {
            return this;
         }
         var conversionFunction = _conversions[this.typename][typename];
         if (!conversionFunction) {
            return undefined;
         }
         else {
            return conversionFunction(this);
         }
      },
      // Checks whether a conversion function between this object and another type exists.
      //
      // typename: Name of the type you want to convert to. Must be a type name that's already
      //           been defined.
      canConvert: function(typename) {
         if (!AT.typeIsDefined(typename)) {
            console.error("Type " + typename + " not defined.");
            return undefined;
         }
         if (typename == this.typename) { return true; }
         return (_conversions[this.typename][typename] !== undefined);
      },
      // Helper function for defining an immutable property on this object.
      // Meant to be used primarily in initializers, and not anywhere else.
      //
      // propertyName: A string containing the desired name of the property.
      // value: The value you want it to have. This cannot be changed later.
      _def: function(propertyName, value) {
         if (typeof propertyName !== "string") {
            console.error(
               "Attempted to define a property with non-string name ("+propertyName+")");
            return;
         }
         Object.defineProperty(this, propertyName, {value: value, writeable: false});
      }
   };

   // Checks whether a type with the given name is already defined.
   // 
   // typename: The name of the type you want to check for. Must be a string, if not a string
   //           this function returns false.
   AT.typeIsDefined = function(typename) {
      return typeof(typename) === "string" && _types.hasOwnProperty(typename)
   };

   // Internal function to build an Atypical type. Sets up the correct prototype, the
   // required functions, and so on.
   //
   // implementation: An object containing the implementation of the required members and 
   //                 functions for the type. These are:
   //                 typename: A string containing the name of the type. Must be unique and
   //                           follow Javascript identifier syntax.
   //                 init: Initialization function. Should take the same arguments as your
   //                       constructor and handle all initialization logic. Should also do any
   //                       required validation of the arguments and throw a ConstructionError if
   //                       incorrect arguments are provided.
   //                 This object may also contain any other functions and elements that are
   //                 required for this type.
   AT.defineType = function(implementation) {
      if (typeof implementation.init !== "function") {
         console.error("Initialization function is required when creating a new type.");
         return undefined;
      }
      if (typeof implementation.typename !== "string") {
         console.error("Typename string is required when creating a new type.");
         return undefined;
      }
      if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(implementation.typename)) {
         console.error("Typename must follow Javascript identifier syntax.");
         return undefined;
      }

      // For reasons I don't entirely understand, doing something like this:
      //
      //     var AtypicalType = function() {
      //         this.init.apply(this, arguments);
      //     }
      //     
      // And then returning AtypicalType at the end of the function, ends up making the
      // Chrome developer tools infer the name of EVERY SINGLE TYPE defined using this
      // function as "AtypicalType", leaving you debugging monstrosities like this in
      // the console:
      // 
      //     AtypicalType {x: AtypicalType, y: AtypicalType, z: AtypicalType}
      //
      // So I'm making a deal with the devil and using "eval" instead. Below, we set 
      // AtypicalType to an object of the format:
      //
      //     { typename: constructor function }
      //     
      // This causes the Chrome dev tools to pick up the typename as the actual display name
      // of the type, which is much better:
      //
      //     Vector3 {x: Float, y: Float, z: Float}
      // 
      // Restricting the typename as I did above should keep this from being used for
      // too much evil.
      // Bless me father, for I have sinned.
      var AtypicalType = eval("(function() { return {\n" +
         "\"" + implementation.typename + "\": function() {\n" +
            "this.init.apply(this, arguments);\n" +
            "}\n" +
            "};})()");

      var proto = Object.create(AT.Type.prototype);

      for (var element in implementation) {
         proto[element] = implementation[element];
      }

      AtypicalType[implementation.typename].prototype = proto;

      _types[implementation.typename] = AtypicalType[implementation.typename];
      return AtypicalType[implementation.typename];
   };

   // Adds a conversion function to the global list of conversion functions, enabling it to
   // be used with Atypical.Type.convert.
   // If called multiple times with the same types, each call overrides the previous
   // conversion function.
   //
   // sourceTypename: The name of the type you're converting from. Must be a type that's
   //                 already been defined.
   // destinationTypename: The name of the type you're converting to. Must be a type that's
   //                      already been defined.
   // conversionFunction: A function, taking in one argument of the source type, that returns
   //                     a value of the destination type, to be used for conversion.
   AT.defineConversion = function(sourceTypename, destinationTypename, conversionFunction) {
      if (!( typeof sourceTypename === "string" 
         && typeof destinationTypename === "string"
            && typeof conversionFunction === "function"))
      {
         console.error("Error adding type conversion, incorrect arguments.");
         return;
      }
      if (conversionFunction.length !== 1) {
         console.error("Conversion function must be of exactly one argument.");
         return;
      }
      if (!_types.hasOwnProperty(sourceTypename)) {
         console.error("Source type " + sourceTypename + " not defined.");
         return;
      }
      if (!_types.hasOwnProperty(destinationTypename)) {
         console.error("Destination type " + destinationTypename + " not defined.");
         return;
      }

      if (!_conversions[sourceTypename]) {
         _conversions[sourceTypename] = {};
      }
      _conversions[sourceTypename][destinationTypename] = conversionFunction;
   };

   // If you have a conversion between an intermediary type T and a destination type D (T -> D),
   // this allows you to repurpose all your conversions from any source type S -> T to conversions
   // from S -> D by using T as an intermediary, S -> T -> D. For example, allowing you do define
   // all your conversions from S -> Float to conversions from S -> Int by converting first to Float
   // and then rounding through the Float -> Int conversion.
   //
   // intermediaryTypename: The name of the type you'd like to use as an intermediary. Must have
   //                       already been defined.
   // destinationTypename: The name of the type you'd like to convert to. Must have already been
   //                      defined.
   //
   // Note: If you have already specified a conversion between S and D, this function will
   // overwrite this previously-specified conversion.
   AT.defineConversionsViaIntermediary = function(intermediaryTypename, destinationTypename) {
      if (!( typeof destinationTypename === "string"
         && typeof intermediaryTypename === "string"))
      {
         console.error("Error adding intermediary to conversion, type names must be strings.");
         return;
      }
      if (!_types.hasOwnProperty(intermediaryTypename)) {
         console.error("Intermediary type " + intermediaryTypename + " not defined.");
         return;
      }
      if (!_types.hasOwnProperty(destinationTypename)) {
         console.error("Destination type " + destinationTypename + " not defined.");
         return;
      }

      if (!_conversions[intermediaryTypename][destinationTypename]) {
         console.error("Attempted to set " + intermediaryTypename + " as an intermediary for "
            + destinationTypename + ", but no conversion between the two types exists.")
         return;
      }

      for (let sourceTypename in _conversions) {
         if (_conversions[sourceTypename]
            && _conversions[sourceTypename][intermediaryTypename]
               && sourceTypename !== destinationTypename)
         {
            let conversionToIntermediary = _conversions[sourceTypename][intermediaryTypename];
            let conversionToDestination = _conversions[intermediaryTypename][destinationTypename];
            _conversions[sourceTypename][destinationTypename] = function(value) {
               return conversionToDestination(conversionToIntermediary(value));
            }
         }
      }
   };

   // Construction error. Meant to be thrown in a type's constructor if the type was instantiated
   // with incorrect arguments.
   AT.ConstructionError = function(message) { this.init(message); };
   AT.ConstructionError.prototype = {
      init: function(message) {
         this.name = "ConstructionError";
         this.message = (message || "Type was constructed with incorrect arguments");
      }
   };

   // Type definitions start here.

   AT.String = AT.defineType({
      typename: "String",
      init: function(s) {
         this._def("str", "" + s);
      },
   });

   AT.Float = AT.defineType({
      typename: "Float",
      init: function(n) {
         if (n instanceof Number) {
            n = n.valueOf();
         }
         if (isNaN(n)) {
            throw new AT.ConstructionError("Float constructed with non-numerical input ("+n+")");
         }
         this._def("n", n);
      }
   });
   AT.defineConversion("Float", "String", function(f) {
      return new AT.String("" + f.n.toFixed(3));
   });
   AT.defineConversion("String", "Float", function(str) {
      var num = parseFloat(str.str);
      if (isNaN(num)) {
         return new AT.Float(0);
      }
      else {
         return new AT.Float(num);
      }
   });

   AT.Vector3 = AT.defineType({
      typename: "Vector3",
      init: function(x, y, z) {
         if (x instanceof AT.Float && y instanceof AT.Float && z instanceof AT.Float) {
            this._def("x", x);
            this._def("y", y);
            this._def("z", z);
         }
         else {
            // AT.Float will take care of validating our arguments.
            this._def("x", new AT.Float(x));
            this._def("y", new AT.Float(y));
            this._def("z", new AT.Float(z));
         }
      },
      magnitude: function() {
         return sqrt(this.x.n*this.x.n + this.y.n*this.y.n + this.z.n*this.z.n);
      }
   });
   AT.defineConversion("Vector3", "Float", function(vec) {
      return new AT.Float(vec.magnitude());
   });
   AT.defineConversion("Float", "Vector3", function(r) {
      return new AT.Vector3(new AT.Float(r.n), new AT.Float(r.n), new AT.Float(r.n));
   });

   AT.Int = AT.defineType({
      typename: "Int",
      init: function(n) {
         if (n instanceof Number) {
            n = n.valueOf();
         }
         this._def("n", Math.round(n));
      }
   });
   AT.defineConversion("Float", "Int", function(num) {
      try {
         return new AT.Int(num.n);
      }
      catch (error) {
         if (error instanceof AT.ConstructionError) {
            return undefined;
         }
         else {
            throw error;
         }
      }
   });
   AT.defineConversion("Int", "Float", function(i) {
      return new AT.Float(i.n);
   });
   AT.defineConversionsViaIntermediary("Float", "Int");

   AT.Bool = AT.defineType({
      typename: "Bool",
      init: function(b) {
         this._def("b", !!b);
      },
      not: function() {
         return new AT.Bool(!this.b);
      },
      and: function(other) {
         return new AT.Bool(this.b && other.b);
      },
      or: function(other) {
         return new AT.Bool(this.b || other.b);
      },
      xor: function(other) {
         return new AT.Bool(this.b !== other.b);
      }
   });
   AT.defineConversion("Bool", "String", function(b) {
      return new AT.String(b.b ? "true" : "false");
   });
   AT.defineConversion("String", "Bool", function(str) {
      var lower = str.str.toLowerCase();
      return new AT.Bool(lower !== "false" && lower !== "0" && lower !== "f");
   });
   AT.defineConversion("Int", "Bool", function(i) {
      return new AT.Bool(i.n);
   });
   AT.defineConversion("Float", "Bool", function(num) {
      return new AT.Bool(Math.abs(num.n) > 0.001);
   });
   AT.defineConversion("Vector3", "Bool", function(v) {
      let notZero = (Math.abs(v.x) > 0.001 || Math.abs(v.y) > 0.001 || Math.abs(v.z) > 0.001);
      return new AT.Bool(notZero);
   });
   AT.defineConversion("Bool", "Int", function(b) {
      return new AT.Int(b.b ? 1 : 0);
   });
   AT.defineConversion("Bool", "Float", function(b) {
      return new AT.Float(b.b ? 1 : 0);
   });
   AT.defineConversion("Bool", "Vector3", function(b) {
      return new AT.Vector3(0, b.b ? 1 : 0, 0);
   });

   // TODO: add string conversion for all other types


   return AT;
}())

// Convenience alias to make it easier to type.
var AT = Atypical;
