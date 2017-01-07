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
               init: function(x) {
                  this._def("thing", x);
               },
               dummyname: "dummyvalue",
               getDummy: function() { return this.dummyname; }
            });
            assert(Test1);
            assert(AT.typeIsDefined("Test1"));
            assert(!AT.typeIsDefined("Test2"));

            let test1 = new Test1(456);

            assert(test1.dummyname === "dummyvalue");
            assert(test1.getDummy() === "dummyvalue");
            assert(test1.thing === 456);
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
            let test1 = new Test1();

            let Test2 = AT.defineType({
               typename: "Test2",
               init: function(){}
            });
            let test2 = new Test2();

            let Test3 = AT.defineType({
               typename: "Test3",
               init: function(){}
            });
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

         // Test that definite conversions via intermediaries work
         function() {
            let Source = AT.defineType({
               typename: "Source",
               init: function(x) {
                  this._def("x", x);
               }
            });
            let source = new Source(5);

            let Intermediary = AT.defineType({
               typename: "Intermediary",
               init: function(){}
            });
            let intermediary = new Intermediary();

            let Destination = AT.defineType({
               typename: "Destination",
               init: function(y) {
                  if (y === undefined) {
                     y = 0;
                  }
                  this._def("y", y);
               }
            });
            let destination = new Destination();

            AT.defineConversion("Source", "Intermediary", function(x) {
               return new Intermediary();
            });
            AT.defineConversion("Intermediary", "Destination", function(x) {
               return new Destination();
            });

            assert(!AT.canConvert("Source", "Destination"));

            AT.defineConversionsViaIntermediary("Source", "Intermediary", "Destination");

            assert(AT.canConvert("Source", "Destination"));
            assert(source.canConvert("Destination"));
            assert(source.convert("Destination").y === 0);

            // Ensure you can still override intermediary conversions if need be
            AT.defineConversion("Source", "Destination", function(s) {
               return new Destination(s.x);
            });
            assert(source.convert("Destination").y === 5);
         },

         // Test that indefinite conversions via intermediaries, to any destination, work
         function() {
            let Source = AT.defineType({
               typename: "Source",
               init: function(x) {
                  this._def("x", x);
               }
            });
            let source = new Source(5);

            let Intermediary = AT.defineType({
               typename: "Intermediary",
               init: function(){}
            });
            let intermediary = new Intermediary();

            let Destination = AT.defineType({
               typename: "Destination",
               init: function(y) {
                  if (y === undefined) {
                     y = 0;
                  }
                  this._def("y", y);
               }
            });
            let destination = new Destination();

            AT.defineConversion("Source", "Intermediary", function(x) {
               return new Intermediary();
            });
            AT.defineConversion("Intermediary", "Destination", function(x) {
               return new Destination();
            });

            assert(!AT.canConvert("Source", "Destination"));

            AT.defineConversionsViaIntermediary("Source", "Intermediary", null);

            assert(AT.canConvert("Source", "Destination"));
            assert(source.canConvert("Destination"));
            assert(source.convert("Destination").y === 0);

            // Ensure you can still override intermediary conversions if need be
            AT.defineConversion("Source", "Destination", function(s) {
               return new Destination(s.x);
            });
            assert(source.convert("Destination").y === 5);
         },

         // Test that indefinite conversions via intermediaries, from any source, work
         function() {
            let Source = AT.defineType({
               typename: "Source",
               init: function(x) {
                  this._def("x", x);
               }
            });
            let source = new Source(5);

            let Intermediary = AT.defineType({
               typename: "Intermediary",
               init: function(){}
            });
            let intermediary = new Intermediary();

            let Destination = AT.defineType({
               typename: "Destination",
               init: function(y) {
                  if (y === undefined) {
                     y = 0;
                  }
                  this._def("y", y);
               }
            });
            let destination = new Destination();

            AT.defineConversion("Source", "Intermediary", function(x) {
               return new Intermediary();
            });
            AT.defineConversion("Intermediary", "Destination", function(x) {
               return new Destination();
            });

            assert(!AT.canConvert("Source", "Destination"));

            AT.defineConversionsViaIntermediary(null, "Intermediary", "Destination");

            assert(AT.canConvert("Source", "Destination"));
            assert(source.canConvert("Destination"));
            assert(source.convert("Destination").y === 0);

            // Ensure you can still override intermediary conversions if need be
            AT.defineConversion("Source", "Destination", function(s) {
               return new Destination(s.x);
            });
            assert(source.convert("Destination").y === 5);
         },

         // Test that intermediary conversions work even when definite conversions are defined only
         // after the intermediary is established.
         function() {
            let Left = AT.defineType({
               typename: "Left",
               init: function(){}
            });
            let left = new Left();

            let Middle = AT.defineType({
               typename: "Middle",
               init: function(){}
            });
            let middle = new Middle();

            let Right = AT.defineType({
               typename: "Right",
               init: function(){}
            });
            let right = new Right();

            AT.defineConversion("Left", "Middle", function(x) {
               return new Middle();
            });
            AT.defineConversion("Middle", "Left", function(x) {
               return new Left();
            });

            // No conversions from Left <-> Right are defined yet,
            // nor are any Middle <-> Right conversions.
            assert(!left.canConvert("Right"));
            assert(!right.canConvert("Left"));
            assert(!middle.canConvert("Right"));
            assert(!right.canConvert("Middle"));

            // Now define conversions for Left <-> Middle <-> T for any T where Middle <-> T exists.
            AT.defineConversionsViaIntermediary("Left", "Middle", null);
            AT.defineConversionsViaIntermediary(null, "Middle", "Left");

            // This still shouldn't change anything just yet.
            assert(!left.canConvert("Right"));
            assert(!right.canConvert("Left"));
            assert(!middle.canConvert("Right"));
            assert(!right.canConvert("Middle"));

            // NOW, define conversion for Middle -> Right, enabling the
            // Left -> Middle -> Right conversion.
            AT.defineConversion("Middle", "Right", function(x) {
               return new Right();
            });

            // This changes some of the landscape.
            assert(left.canConvert("Right"));
            assert(!right.canConvert("Left"));
            assert(middle.canConvert("Right"));
            assert(!right.canConvert("Middle"));

            // NOW, define conversion for Right -> Middle, enabling the
            // Right -> Middle -> Right conversion.
            AT.defineConversion("Right", "Middle", function(x) {
               return new Right();
            });

            // And now we have all our conversions.
            assert(left.canConvert("Right"));
            assert(right.canConvert("Left"));
            assert(middle.canConvert("Right"));
            assert(right.canConvert("Middle"));
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
