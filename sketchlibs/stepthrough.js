"use strict";

var Stepthrough = (function() {
   let Stepthrough = {};
   
   // CREATE A GENERATOR STEP-THROUGH PROCEDURE
   // https://x.st/javascript-coroutines/
   Stepthrough.makeStepFunc = function(procedure, args) {
      let generator = procedure(args);
      // generator.next();
      return function(arg) {
         return generator.next(arg);
      } 
   };

   return Stepthrough;
})();
