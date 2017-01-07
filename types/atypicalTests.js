"use strict";

// This file is meant for testing the Atypical type system.
// To use it, add it to an HTML file WITHOUT adding atypical.js to it. This test will do so instead.
var AtypicalTests = (function() {
   var T = {}

   function assert(expression) {
      console.assert(expression);
      if (!expression) {
         testsPassed = false;
      }
   }

   function reloadAtypical(completion) {
      var originalScript = document.getElementById("atypical");
      if (originalScript) {
         originalScript.remove();
      }

      var script = document.createElement("script");
      script.id = "atypical";
      script.src = "atypical.js";
      script.onloadend = completion;
      document.head.appendChild(script);
   }

   // Add any new test functions to this array.
   // The Atypical type system will be reset after every one.
   var tests = [
      // Test that defining types works
      function () {
         Test1 = AT.defineType({
            typename: "Test1",
            init: function(){}
         });
         assert(Test1);
      },
      // Test that defining duplicate tests does not work
      function () {
         Test1 = AT.defineType({
            typename: "Test1",
            init: function(){}
         });
         assert(Test1);
         
         Test1Duplicate = AT.defineType({
            typename: "Test1",
            init: function(){}
         });
         assert(!Test1Duplicate);
      },
   ];
   
   T.runTests = function(allTestsComplete) {
      function runTest(i, testComplete) {
         let passed = tests[i]();
         reloadAtypical(function() {
            runTest(i+1, function(nextPassed) {
               testComplete(passed && nextPassed);
            });
         });
      }
      runTest(0, function(testsPassed) {
         allTestsComplete(testsPassed);
      });
   }

   

   return T;
})()
