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

   var atypicalSource = "";
   function loadAtypical(completion) {
      var request = new XMLHttpRequest();
      request.open("GET", "atypical.js");
      request.filename = "atypical.js";
      request.onloadend = function() {
         atypicalSource = this.responseText;
         resetAtypical();
         completion();
      }
      request.send();
   }

   function resetAtypical() {
      var x = eval(atypicalSource);
      console.log(x);
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
   
   T.runTests = function(completion) {
      var testsPassed = true;
      loadAtypical(function() {
         for (let i = 0; i < tests.length; i++) {
            resetAtypical();
            console.log("ATYPICAL IS: ");
            console.error(AT);
            tests[i]();
         }

         completion(testsPassed);
      });
   }

   

   return T;
})()
