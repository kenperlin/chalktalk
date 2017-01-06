"use strict";

(function(AT) {
   // Chalktalk-specific type defintions go in this file.

   // Unknown types are meant for sketches and objects that have not been converted to use
   // Atypical types yet. They're not convertible to or from anything and are just dumb
   // wrappers around JS variables.
   AT.UnknownType = AT.defineType({
      typename: "UnknownType",
      init: function(val) {
         this._def("val", val);
      }
   });

   // Type defining an angle in radians, wrapped to interval between -PI and PI,
   // freely convertible to Float
   AT.Radians = AT.defineType({
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
      }
   });
   AT.defineConversion("Radians", "Float", function(ang) {
      return new AT.Float(ang.theta);
   });
   AT.defineConversion("Float", "Radians", function(f) {
      return new AT.Radians(f.n); // Constructor takes care of wrapping
   });
   AT.defineConversionsViaIntermediary(null, "Float", "Radians");
   AT.defineConversionsViaIntermediary("Radians", "Float", null);
   AT.defineConversion("Radians", "String", function(ang) {
      return new AT.String(ang.theta.toFixed(2) + " rad")
   });
})(Atypical);
