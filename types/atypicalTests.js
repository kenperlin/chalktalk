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
         function () {
            let Test1 = AT.defineType({
               typename: "Test1",
               init: function(){}
            });
            assert(Test1);
            assert(AT.typeIsDefined("Test1"));
            assert(!AT.typeIsDefined("Test2"));
         },

         // Test that defining duplicate tests does not work
         function () {
            let Test1 = AT.defineType({
               typename: "Test1",
               init: function(){}
            });
            assert(Test1);
            assert(AT.typeIsDefined("Test1"));

            disableConsoleErrors();
            let Test1Duplicate = AT.defineType({
               typename: "Test1",
               init: function(){}
            });
            enableConsoleErrors();
            assert(!Test1Duplicate);
            assert(AT.typeIsDefined("Test1"));
         },

         // Test that basic conversions work
         function() {
            let Test1 = AT.defineType({
               typename: "Test1",
               init: function(){}
            });
            assert(Test1);
            let test1 = new Test1();

            let Test2 = AT.defineType({
               typename: "Test2",
               init: function(){}
            });
            assert(Test2);
            let test2 = new Test2();

            let Test3 = AT.defineType({
               typename: "Test3",
               init: function(){}
            });
            assert(Test3);
            let test3 = new Test3();

            AT.defineConversion("Test1", "Test2", function(x){ return new Test2(); });

            assert(AT.canConvert("Test1", "Test2"));
            assert(test1.canConvert("Test2"));

            assert(!AT.canConvert("Test1", "Test3"));
            assert(!test1.canConvert("Test3"));

            // Conversions are not bidirectional by default
            assert(!AT.canConvert("Test2", "Test1"));
            assert(!test2.canConvert("Test1"));
         },
      ];

      var testsPassed = true;
      var AT = {};

      function assert(expression) {
         console.assert(expression);
         if (!expression) {
            testsPassed = false;
         }
      }

      var defaultError = console.error;

      function disableConsoleErrors() {
         console.error = function(){};
      }
      function enableConsoleErrors() {
         console.error = defaultError;
      }
      

      for (let i = 0; i < tests.length; i++) {
         // Ensure the tests use a fresh, clean AT module with no definitions from the other tests.
         AT = window.AT._createTestingModule();

         tests[i]();

         enableConsoleErrors(); // Just in case the previous tests forgot to re-enable them.
      }

      return testsPassed;
   }

   return T;
})()
