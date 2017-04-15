"use strict";

(function AdditionalTypes(AT) {
   // Chalktalk-specific type defintions go in this file.
   
   // Override the _createTestingModule function so that we can test these additional types as well
   let originalModuleCreator = AT._createTestingModule;
   AT._createTestingModule = function() {
      let newAT = originalModuleCreator();
      AdditionalTypes(newAT);
      return newAT;
   }

   // This type is meant to allow a degree of interoperability for sketches that have not been
   // converted to use Atypical types yet. It's just a dumb wrapper around a JS variable, and while
   // other types can be converted to it, it can't be converted to any type (as it effectively
   // erases any type information).
   AT.defineType({
      typename: "Unknown",
      init: function(value) {
         this._def("value", value);
      },
      toPrimitive: function() {
         return this.value;
      }
   });
   AT.defineConversion(AT.Float, AT.Unknown, function(f) {
      return new AT.Unknown(f.toPrimitive());
   });
   AT.defineConversion(AT.Vector3, AT.Unknown, function(vec) {
      return new AT.Unknown([vec.x, vec.y, vec.z]);
   });
   AT.defineConversion(AT.Bool, AT.Unknown, function(b) {
      return new AT.Unknown(b.toPrimitive());
   });
   AT.defineConversion(AT.String, AT.Unknown, function(s) {
      return new AT.Unknown(s.toPrimitive());
   });

   // Type defining an angle in radians, wrapped to interval between -PI and PI,
   // freely convertible to Float
   AT.defineType({
      typename: "Radians",
      init: function(theta) {
         let mod = function (x, base) {
            // Implements a modulo operator that keeps the result positive, e.g. mod(-0.7, 1) = 0.3
            return ((x % base) + base) % base;
         }
         let wrap = function(x, low, high) {
            // Keeps a value between low and high limits, wrapping when it goes over
            // e.g. wrap(1.1, -1, 1) = -0.9
            return mod(x - low, high - low) + low;
         }
         this._def("theta", wrap(theta, -Math.PI, Math.PI));
      },
      toPrimitive: function() {
         return this.theta;
      }
   });
   AT.defineConversion(AT.Radians, AT.Float, function(ang) {
      return new AT.Float(ang.theta);
   });
   AT.defineConversion(AT.Float, AT.Radians, function(f) {
      return new AT.Radians(f.value); // Constructor takes care of wrapping
   });
   AT.defineConversionsViaIntermediary(AT.String, AT.Float, AT.Radians);
   AT.defineConversion(AT.Radians, AT.String, function(ang) {
      return new AT.String(ang.theta.toFixed(2) + " rad");
   });
   AT.defineConversionsViaIntermediary(AT.Int, AT.Float, AT.Radians);
   AT.defineConversionsViaIntermediary(AT.Radians, AT.Float, AT.Int);

   // TODO: is there a way to do this generically, for all types?
   // Also, does this make sense? And does it makes sense to do this for all types?
   AT.defineConversionsViaIntermediary(AT.Radians, AT.Function(AT.Radians), null);
   AT.defineConversionsViaIntermediary(AT.Radians, AT.Function(AT.Float, AT.Radians), null);

   AT.defineConversionsViaIntermediary(AT.Radians, AT.Float, AT.Unknown);


   // TODO: DOC
   
   AT.defineType({
      typename: "Expression",
      init: function(str) {
         if (str instanceof AT.Expression) { str = str.str; }
         else if (str instanceof AT.String) { str = str.value; }
         this._def("str", "" + str);
      },
      toPrimitive: function() {
         return this.str;
      },
      eval: function() {
         return eval(this.str);
      }
   });

   AT.defineConversion(AT.Expression, AT.String, function(exp) {
      try {
         return new AT.String(exp.eval());
      }
      catch (error) {
         return new AT.String(exp.str);
      }
   });
   AT.defineConversion(AT.String, AT.Expression, function(str) {
      // When strings are converted to expressions, they're escaped and surrounded with quotes
      return new AT.Expression("\"" + str.value.replace(/(["'\\])/g,
         function(str) { return "\\" + str; }
      ) + "\"");
   });

   AT.defineConversion(AT.Expression, AT.Int, function(exp) {
      try {
         return new AT.Int(exp.eval());
      }
      catch (error) {
         return new AT.Int(0);
      }
   });
   AT.defineConversion(AT.Int, AT.Expression, function(i) {
      return new AT.Expression("" + i.value);
   });

   AT.defineConversion(AT.Expression, AT.Float, function(exp) {
      try {
         return new AT.Float(exp.eval());
      }
      catch (error) {
         return new AT.Float(0);
      }
   });
   AT.defineConversion(AT.Float, AT.Expression, function(f) {
      return new AT.Expression("" + f.value);
   });

   AT.defineConversion(AT.Expression, AT.Bool, function(exp) {
      try {
         return new AT.Bool(exp.eval());
      }
      catch (error) {
         return new AT.Bool(false);
      }
   });
   AT.defineConversion(AT.Bool, AT.Expression, function(b) {
      return new AT.Expression("" + b.value);
   });
})(AT);
