"use strict";

// This file is meant for testing the Atypical type system.
// To use it, add it to an HTML file WITHOUT adding atypical.js to it. This test will do so instead.
window.AtypicalTests = (function() {
   var T = {}

   T.runTests = function(allTestsComplete) {
      // Add any new test functions to this array.
      // Each should be a function that takes in the type system module.
      var tests = [
         // Test that defining types works
         function (AT) {
            let Test1 = AT.defineType({
               typename: "Test1",
               init: function(){}
            });
            assert(Test1);
         },
         // Test that defining duplicate tests does not work
         function (AT) {
            let Test1 = AT.defineType({
               typename: "Test1",
               init: function(){}
            });
            assert(Test1);

            let Test1Duplicate = AT.defineType({
               typename: "Test1",
               init: function(){}
            });
            assert(!Test1Duplicate);
         },
      ];

      var testsPassed = true;

      function assert(expression) {
         console.assert(expression);
         if (!expression) {
            testsPassed = false;
         }
      }

      for (let i = 0; i < tests.length; i++) {
         tests[i](AT._createTestingModule());
      }

      return testsPassed;
   }

   return T;
})()
