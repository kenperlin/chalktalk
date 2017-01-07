"use strict";

var AtypicalTests = (function() {
   var T = {}

   var testsPassed = true;

   function assert(expression) {
      console.assert(expression);
      if (!expression) {
         testsPassed = false;
      }
   }

   T.runTests = function() {
      testsPassed = true;

      assert(1 == 1);
      assert(1 == 2);

      return testsPassed;
   }

   return T;
})()
