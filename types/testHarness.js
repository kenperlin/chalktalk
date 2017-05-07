"use strict";

// This file is meant for use when testing the Atypical type system.
// To use it, add it to an HTML file with atypical.js, and any other type definition files,
// included in a script tag above it.
// Then, add a call to TestHarness.runTests(...) in a script anywhere in the document,
// passing in an array of functions containing the tests you'd like to run.

window.TestHarness = (function() {
   var T = {}

   // First, a few utility functions

   T.assert = function(expression) {
      console.assert(expression);
      if (!expression) {
         testsPassed = false;
      }
   }

   T.assertThrows = function(errorType, callback) {
      let errorThrown = false;
      try {
         callback();
      }
      catch (err) {
         if (!(err instanceof errorType)) {
            throw err;
         }
         else {
            errorThrown = true;
         }
      }
      T.assert(errorThrown);
   }

   var defaultError = console.error;

   T.disableConsoleErrors = function() {
      console.error = function(){};
   }

   T.enableConsoleErrors = function() {
      console.error = defaultError;
   }

   // Convenience function for comparing two flat or nested arrays of simple values
   T.arraysEqual = function(a, b) {
      if (a.length !== b.length) { return false; }
      for (let i = 0; i < a.length; i++) {
         if (a[i] instanceof Array && b[i] instanceof Array) {
            if (!T.arraysEqual(a[i], b[i])) {
               return false;
            }
         }
         else if (a[i] !== b[i]) { return false; }
      }
      return true;
   }

   var testsPassed = true;

   // This function will return true if all tests passed, false if not, and will print any
   // test failures via console.assert.
   T.runTests = function(tests) {
      for (let i = 0; i < tests.length; i++) {
         // Ensure the tests use a fresh, clean AT module with no definitions from the other
         // tests.
         window.AT = window.AT._createTestingModule();

         tests[i]();

         T.enableConsoleErrors(); // Just in case the previous tests forgot to re-enable them.
      }

      return testsPassed;
   }

   return T;
})();

window.T = TestHarness;
