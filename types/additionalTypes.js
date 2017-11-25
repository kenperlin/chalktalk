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
         this._set("value", value);
      },
      toPrimitive: function() {
         return this.value;
      }
   });
   AT.defineConversion(AT.Float, AT.Unknown, function(f) {
      return new AT.Unknown(f.toPrimitive());
   });
   AT.defineConversion(AT.Vector, AT.Unknown, function(vec) {
      return new AT.Unknown(vec.values);
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
         this._set("theta", wrap(theta, -Math.PI, Math.PI));
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
   AT.defineConversionsViaIntermediary(AT.Radians, AT.Float, null);

   AT.defineType({
      typename: "Seconds",
      init: function(sec) {
         if (sec instanceof AT.Seconds) { sec = sec.value; }
         sec = AT.wrapOrConvertValue(AT.Float, sec).value; // Easiest way to do validation
         this._set("value", sec);
      },
      toPrimitive: function() {
         return this.value;
      }
   });
   AT.defineConversion(AT.Seconds, AT.Float, function(sec) { return new AT.Float(sec.value); });
   AT.defineConversion(AT.Float, AT.Seconds, function(f) { return new AT.Seconds(f.value); });
   AT.defineConversionsViaIntermediary(null, AT.Float, AT.Seconds);
   AT.defineConversionsViaIntermediary(AT.Seconds, AT.Float, null);
   AT.defineConversionsViaIntermediary(AT.Float, AT.Seconds, null);
   AT.defineConversionsViaIntermediary(null, AT.Seconds, AT.Float);

   AT.defineType({
      typename: "Color",
      init: function(r, g, b, a) {
         if (r instanceof AT.Color) {
            a = r.a;
            b = r.b;
            g = r.g;
            r = r.r;
         }
         else if (r instanceof Array) {
            a = r[3];
            b = r[2];
            g = r[1];
            r = r[0];
         }
         function validate(channel, defaultValue) {
            if (channel === undefined) { channel = defaultValue; }
            channel = AT.wrapOrConvertValue(AT.Float, channel).value;
            return Math.min(1, Math.max(0, channel));
         }
         this._set("r", validate(r, 0));
         this._set("g", validate(g, 0));
         this._set("b", validate(b, 0));
         this._set("a", validate(a, 1));
      },
      luminance: function() {
         return 0.2126*this.r + 0.7152*this.g + 0.0722*this.b;
      },
      getRGB: function() {
         return [this.r, this.g, this.b];
      },
      getRGBString: function() {
         return "rgb(" +
            (this.r * 255).toFixed(0) + "," +
            (this.g * 255).toFixed(0) + "," +
            (this.b * 255).toFixed(0) + ")";
      },
      getRGBA: function() {
         return [this.r, this.g, this.b, this.a];
      }
   });
   AT.defineConversion(AT.Color, AT.Array(AT.Float), function(col) {
      return new (AT.Array(Float))(col.r, col.g, col.b, col.a);
   });
   AT.defineConversion(AT.Array(AT.Float), AT.Color, function(arr) {
      return new AT.Color(arr.get(0), arr.get(1), arr.get(2), arr.get(3));
   });
   AT.defineConversion(AT.Color, AT.String, function(col) {
      return new AT.String(
         "rgba(" + col.r.toFixed(3)
            + ", " + col.g.toFixed(3)
            + ", " + col.b.toFixed(3)
            + ", " + col.a.toFixed(3) + ")");
   });
   AT.defineConversion(AT.String, AT.Color, function(str) {
      let numbers = str.value.split(/[^\d\.]/).map(parseFloat).filter(
         function(value) { return !isNaN(value); }
      );
      return new AT.Color(
         numbers[0] || 0,
         numbers[1] || 0,
         numbers[2] || 0,
         numbers[3] || 0
      );
   });
   // TODO: more conversions?


   // TODO: DOC
   
   AT.defineType({
      typename: "Expression",
      init: function(str) {
         if (str instanceof AT.Expression) { str = str.str; }
         else if (str instanceof AT.String) { str = str.value; }
         this._set("str", "" + str);
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
         let value = exp.eval();
         // Undefined values convert to empty strings
         return new AT.String(value === undefined ? "" : value);
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

   AT.defineConversion(AT.Expression, AT.Float, function(exp) {
      try {
         return new AT.Float(exp.eval());
      }
      catch (error) {
         return new AT.Float(0);
      }
   });

   AT.defineConversion(AT.Expression, AT.Bool, function(exp) {
      try {
         return new AT.Bool(exp.eval());
      }
      catch (error) {
         return new AT.Bool(false);
      }
   });

   (function() {
      function makeFunction(exp, FuncType, argString, defaultArguments, defaultReturnValue) {
         try {
            // Try just evaluating the string directly
            let func = new FuncType(exp.eval());
            func.callSafely.apply(func, defaultArguments); // Call it to test if it works with no errors
            return func;
         } catch(error) {}
         try {
            // Try wrapping the string in parentheses and then evaluating it
            // (Thus turning something like "function (x) { return x; }" into an actual
            // expression "(function (x) { return x; })", which actually gives us a function
            // when passed through eval.)
            let func = new FuncType(eval("(" + exp.str + ")"));
            func.callSafely.apply(func, defaultArguments); // Call it to test if it works with no errors
            return func;
         } catch(error) {}
         try {
            // Lastly, try wrapping the string in a function expression with the given arguments
            let func = new FuncType(eval("(function(" + argString + ") { return "
               + exp.str + "})"));
            func.callSafely.apply(func, defaultArguments); // Call it to test if it works with no errors
            return func;
         } catch(error) {}
         // Forget it, just return a default function.
         return new FuncType(function() { return defaultReturnValue; });
      }

      AT.defineConversion(AT.Expression,
         AT.Function(AT.Float, AT.Float, AT.Float, AT.Float),
         function(exp) {
            return makeFunction(exp, AT.Function(AT.Float, AT.Float, AT.Float, AT.Float),
               "x, y, z", [0,0,0], 0);
         });
      AT.defineConversion(AT.Expression,
         AT.Function(AT.Float, AT.Float, AT.Float),
         function(exp) {
            return makeFunction(exp, AT.Function(AT.Float, AT.Float, AT.Float), "x, y", [0,0], 0);
         });
      AT.defineConversion(AT.Expression,
         AT.Function(AT.Float, AT.Float),
         function(exp) {
            return makeFunction(exp, AT.Function(AT.Float, AT.Float), "x", [0], 0);
         });
      AT.defineConversion(AT.Expression,
         AT.Function(AT.Float),
         function(exp) {
            return makeFunction(exp, AT.Function(AT.Float), "", [], 0);
         });
   })();

   AT.defineConversionsViaIntermediary(AT.Expression, AT.String, AT.Color);

   AT.defineConversion(AT.Expression, AT.Unknown, function(exp) {
      try {
         return new AT.Unknown(exp.eval());
      }
      catch (error) {
         return new AT.Unknown(0);
      }
   });

   // TODO: add conversions to Array(Float) and Vector
})(AT);
