"use strict";

var Stepthrough = (function() {
   let Stepthrough = {};
   
   // CREATE A GENERATOR STEP-THROUGH PROCEDURE
   // https://x.st/javascript-coroutines/
   Stepthrough.makeStepFunc = function(procedure) {
      let generator = procedure();
      // generator.next();
      return function(arg) {
         return generator.next(arg);
      } 
   };

   return Stepthrough;
})();
