"use strict";

// This file is meant for testing the Atypical type system.
// To use it, add it to an HTML file with atypical.js included in a script tag above it.
// Then, add a call to AtypicalTests.runTests() in a script anywhere in the document. 
window.AtypicalTests = (function() {
   var T = {}

   // This function will return true if all tests passed, false if not, and will print any
   // test failures via console.assert.
   T.runTests = function() {
      // Add any new test functions to this array.
      // Each should be a function that takes in no arguments.
      // Each function gets a "clean" version of the Atypical type system, with only basic types
      // defined, via the AT variable. This variable gets reset after every test.
      var tests = [

         //--------------------------------------------------------------------------------
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
        
         //--------------------------------------------------------------------------------
         // Test that defining duplicate types does not work
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
        
         //--------------------------------------------------------------------------------
         // Test that type names are set properly
         function () {
            let MyCoolType = AT.defineType({
               typename: "TestType",
               init: function(){}
            });
            assert(MyCoolType);
            assert(AT.typeIsDefined("TestType"));
            assert(MyCoolType === AT.typeNamed("TestType"));
            assert(MyCoolType.name === "TestType");
         },
        
         //--------------------------------------------------------------------------------
         // Test that type names have proper validation
         function () {
            disableConsoleErrors();
            let Test1 = AT.defineType({
               typename: "Test Type",
               init: function(){}
            });
            let Test2 = AT.defineType({
               typename: "Test-Type",
               init: function(){}
            });
            let Test3 = AT.defineType({
               typename: "3TestType",
               init: function(){}
            });
            let Test4 = AT.defineType({
               typename: "Test<Type",
               init: function(){}
            });
            let Test5 = AT.defineType({
               typename: "TestType    ",
               init: function(){}
            });
            enableConsoleErrors();
            assert(!Test1);
            assert(!Test2);
            assert(!Test3);
            assert(!Test4);
            assert(!Test5);
         },

         //--------------------------------------------------------------------------------
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

         //--------------------------------------------------------------------------------
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

         //--------------------------------------------------------------------------------
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

         //--------------------------------------------------------------------------------
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
         
         //--------------------------------------------------------------------------------
         // TODO: should intermediary conversions override previously-defined explicit conversions?
         // Need to decide that.
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

            AT.defineConversion("Source", "Destination", function(s) {
               return new Destination(s.x);
            });

            assert(AT.canConvert("Source", "Destination"));
            assert(source.canConvert("Destination"));
            assert(source.convert("Destination").y === 5);

            AT.defineConversionsViaIntermediary(null, "Intermediary", "Destination");

            // TODO: is this correct behaviour? Seems like potentially surprising behaviour.
            assert(source.convert("Destination").y === 0);
         },

         //--------------------------------------------------------------------------------
         // Test that intermediary conversions work even when definite conversions are defined only
         // after the intermediary is established. (i.e. "implicit" intermediary conversions)
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

            // Now define conversions for Left <-> Middle <-> T
            // for any T where Middle <-> T exists.
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
            // Right -> Middle -> Left conversion.
            AT.defineConversion("Right", "Middle", function(x) {
               return new Right();
            });

            // And now we have all our conversions.
            assert(left.canConvert("Right"));
            assert(right.canConvert("Left"));
            assert(middle.canConvert("Right"));
            assert(right.canConvert("Middle"));
         },

         //--------------------------------------------------------------------------------
         // Ensure implicit intermediary conversions don't override previously-specified definite
         // conversions.
         function() {
            let Left = AT.defineType({
               typename: "Left",
               init: function(x) {
                  this._def("x", x ? x : "nothing left");
               }
            });
            let left = new Left("leftValue");

            let Middle = AT.defineType({
               typename: "Middle",
               init: function(){}
            });
            let middle = new Middle();

            let Right = AT.defineType({
               typename: "Right",
               init: function(x) {
                  this._def("x", x ? x : "nothing right");
               }
            });
            let right = new Right("rightValue");

            AT.defineConversion("Left", "Middle", function(x) {
               return new Middle();
            });
            AT.defineConversion("Middle", "Left", function(x) {
               return new Left();
            });

            // Define conversions for Left <-> Middle <-> T
            // for any T where Middle <-> T exists.
            AT.defineConversionsViaIntermediary("Left", "Middle", null);
            AT.defineConversionsViaIntermediary(null, "Middle", "Left");

            // But also define an explicit Left -> Right conversion.
            AT.defineConversion("Left", "Right", function(l) {
               return new Right(l.x);
            });

            // NOW, define conversion for Middle -> Right, enabling the
            // Left -> Middle -> Right intermediary conversion.
            AT.defineConversion("Middle", "Right", function(x) {
               return new Right();
            });

            assert(left.canConvert("Right"));
            assert(!right.canConvert("Left"));
            assert(middle.canConvert("Right"));
            assert(!right.canConvert("Middle"));

            // BUT we should still have our custom conversion function.
            // The implicitly created intermediary one should not have overridden it.
            assert(left.convert("Right").x === "leftValue");

            // NOW, define conversion for Right -> Middle, enabling the
            // Right -> Middle -> Left conversion.
            AT.defineConversion("Right", "Middle", function(x) {
               return new Right();
            });

            // And now we have all our conversions.
            assert(left.canConvert("Right"));
            assert(right.canConvert("Left"));
            assert(middle.canConvert("Right"));
            assert(right.canConvert("Middle"));

            // This should still be custom.
            assert(left.convert("Right").x === "leftValue");
            // But the reverse should be the intermediary conversion.
            assert(right.convert("Left").x === "nothing left");
            
            // Until we define our own custom conversion for the reverse.
            AT.defineConversion("Right", "Left", function(r) {
               return new Left(r.x);
            });

            // And now the custom conversion should override the intermediary one.
            assert(right.convert("Left").x === "rightValue");
         },

         //--------------------------------------------------------------------------------
         // Test chained, implicit intermediary conversions
         // TODO: should you be able to go all the way down any chain that allows you to?
         function() {
            let One = AT.defineType({
               typename: "One",
               init: function(x) { this._def("x", x); }
            });
            let one = new One(1);
            
            let Two = AT.defineType({
               typename: "Two",
               init: function(x) { this._def("x", x); }
            });
            let two = new Two(2);

            let Three = AT.defineType({
               typename: "Three",
               init: function(x) { this._def("x", x); }
            });
            let three = new Three(3);

            let Four = AT.defineType({
               typename: "Four",
               init: function(x) { this._def("x", x); }
            });
            let four = new Four(4);

            // Define conversions 2 -> 3 -> 4
            AT.defineConversion("Two", "Three", function(x){ return new Three(x.x); });
            AT.defineConversion("Three", "Four", function(x){ return new Four(x.x); });

            AT.defineConversionsViaIntermediary(null, "Three", "Four");

            // You should be able to convert downwards along the 2 -> 3 -> 4 chain now
            assert(!one.canConvert("Two")); // Still not defined
            assert(two.convert("Three").x === 2);
            assert(two.convert("Four").x === 2);
            assert(three.convert("Four").x === 3);

            // This shouldn't change anything immediately
            AT.defineConversionsViaIntermediary(null, "Two", "Three");

            assert(!one.canConvert("Two")); // Still not defined
            assert(two.convert("Three").x === 2);
            assert(two.convert("Four").x === 2);
            assert(three.convert("Four").x === 3);

            // But this should.
            AT.defineConversion("One", "Two", function(x) { return new One(x.x); });
            
            // This is obvious.
            assert(one.convert("Two").x === 1); 
            // This should also have been defined by the intermediary conversion.
            assert(one.convert("Three").x === 1); 

            // TODO: is this correct behaviour though?
            assert(!one.canConvert("Four")); 
            // After all, you can convert 2 -> 3 -> 4 without problem, 1 -> 2 gives an entry point
            // into that chain, so should this be allowed?
         },
         
         //--------------------------------------------------------------------------------
         // Test primitive types
         function() {
            let Prim = AT.defineType({
               typename: "Prim",
               init: function(x) { this._def("x", x); },
               toPrimitive: function() { return this.x; }
            });
            let prim = new Prim(6);


            let NonPrim = AT.defineType({
               typename: "NonPrim",
               init: function(y) { this._def("y", y); },
            });
            let nonPrim = new NonPrim(17);

            assert(prim.isPrimitive());
            assert(!nonPrim.isPrimitive());
            assert(AT.isPrimitive("Prim"));
            assert(!AT.isPrimitive("NonPrim"));

            assert(prim.toPrimitive() === 6);
            assert((new Prim(prim.toPrimitive())).x === 6)
         }
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
