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
            assert(AT.Test1);
            assert(AT.typeIsDefined("Test1"));
            assert(AT.typeIsDefined(Test1));
            assert(!AT.typeIsDefined("Test2"));

            let test1 = new AT.Test1(456);

            assert(test1.dummyname === "dummyvalue");
            assert(test1.getDummy() === "dummyvalue");
            assert(test1.thing === 456);
            assert(test1.type === Test1);
            assert(test1.type.name === "Test1");
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
            let workingTestNames = ["TestType", "Test_Type", "_TestType", "Test3Type",
               "TestType3", "_TestType_", "testtype"];
            for (let i = 0; i < workingTestNames.length; i++) {
               let MyCoolType = AT.defineType({
                  typename: workingTestNames[i],
                  init: function(){}
               });
               assert(MyCoolType !== undefined);
               assert(AT.hasOwnProperty(workingTestNames[i]));
               assert(AT.typeIsDefined(workingTestNames[i]));
               assert(AT.typeIsDefined(MyCoolType));
               assert(MyCoolType === AT.typeNamed(workingTestNames[i]));
               assert(MyCoolType === AT[workingTestNames[i]]);
               assert(MyCoolType.name === workingTestNames[i]);
            }
         },
        
         //--------------------------------------------------------------------------------
         // Test that type names have proper validation
         function () {
            let brokenTestnames = ["Test Type", "Test-Type", "3TestType", "Test<Type",
               "TestType ", " TestType", "$TestType", "Test$Type"];

            for (let i = 0; i < brokenTestnames.length; i++) {
               disableConsoleErrors();
               let Test = AT.defineType({
                  typename: brokenTestnames[i],
                  init: function(){}
               });
               enableConsoleErrors();
               assert(Test === undefined);
               assert(AT[brokenTestnames[i]] === undefined);
            }
         },
        
         //--------------------------------------------------------------------------------
         // Test that you can't define types with the same name as a built-in function
         // in Object.prototype or previously-defined Atypical functions
         function () {
            let brokenTestnames = ["isPrototypeOf", "hasOwnProperty", "valueOf", "defineType",
               "typeIsDefined", "isPrimitive", "canConvert", "Type"];

            for (let i = 0; i < brokenTestnames.length; i++) {
               disableConsoleErrors();
               let Test = AT.defineType({
                  typename: brokenTestnames[i],
                  init: function(){}
               });
               enableConsoleErrors();
               assert(Test === undefined);
            }
         },

         //--------------------------------------------------------------------------------
         // Test that basic conversions work
         function() {
            let Test1 = AT.defineType({
               typename: "Test1",
               init: function(x) { this._def("x", x); }
            });
            let test1 = new Test1(56);

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

            AT.defineConversion(Test1, Test2, function(x){ return new Test2(); });

            assert(AT.canConvert(Test1, Test2));
            assert(test1.canConvert(Test2));

            assert(!AT.canConvert(Test1, Test3));
            assert(!test1.canConvert(Test3));

            assert(AT.canConvert(Test1, Test1));
            assert(test1.convert(Test1).x === 56);

            // Conversions are not bidirectional by default
            assert(!AT.canConvert(Test2, Test1));
            assert(!test2.canConvert(Test1));
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

            AT.defineConversion(Source, Intermediary, function(x) {
               return new Intermediary();
            });
            AT.defineConversion(Intermediary, Destination, function(x) {
               return new Destination();
            });

            assert(!AT.canConvert(Source, Destination));

            AT.defineConversionsViaIntermediary(Source, Intermediary, Destination);

            assert(AT.canConvert(Source, Destination));
            assert(source.canConvert(Destination));
            assert(source.convert(Destination).y === 0);

            // Ensure you can still override intermediary conversions if need be
            AT.defineConversion(Source, Destination, function(s) {
               return new Destination(s.x);
            });
            assert(source.convert(Destination).y === 5);
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

            AT.defineConversion(Source, Intermediary, function(x) {
               return new Intermediary();
            });
            AT.defineConversion(Intermediary, Destination, function(x) {
               return new Destination();
            });

            assert(!AT.canConvert(Source, Destination));

            AT.defineConversionsViaIntermediary(Source, Intermediary, null);

            assert(AT.canConvert(Source, Destination));
            assert(source.canConvert(Destination));
            assert(source.convert(Destination).y === 0);

            // Ensure you can still override intermediary conversions if need be
            AT.defineConversion(Source, Destination, function(s) {
               return new Destination(s.x);
            });
            assert(source.convert(Destination).y === 5);
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

            AT.defineConversion(Source, Intermediary, function(x) {
               return new Intermediary();
            });
            AT.defineConversion(Intermediary, Destination, function(x) {
               return new Destination();
            });

            assert(!AT.canConvert(Source, Destination));

            AT.defineConversionsViaIntermediary(null, Intermediary, Destination);

            assert(AT.canConvert(Source, Destination));
            assert(source.canConvert(Destination));
            assert(source.convert(Destination).y === 0);

            // Ensure you can still override intermediary conversions if need be
            AT.defineConversion(Source, Destination, function(s) {
               return new Destination(s.x);
            });
            assert(source.convert(Destination).y === 5);
         },
         
         //--------------------------------------------------------------------------------
         // Ensure that broad intermediary conversions can't override explicit conversions
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

            AT.defineConversion(Source, Intermediary, function(x) {
               return new Intermediary();
            });
            AT.defineConversion(Intermediary, Destination, function(x) {
               return new Destination();
            });

            assert(!AT.canConvert(Source, Destination));

            AT.defineConversion(Source, Destination, function(s) {
               return new Destination(s.x);
            });

            assert(AT.canConvert(Source, Destination));
            assert(source.canConvert(Destination));
            assert(source.convert(Destination).y === 5);

            AT.defineConversionsViaIntermediary(null, Intermediary, Destination);

            // Previous conversion should be preserved.
            assert(source.convert(Destination).y === 5);

            // However, a narrow intermediary conversion should override the previous conversion.
            AT.defineConversionsViaIntermediary(Source, Intermediary, Destination);
            assert(source.convert(Destination).y === 0);
         },
         
         //--------------------------------------------------------------------------------
         // Test that broad intermediary conversions are overriden by later broad intermediary
         // conversions
         function() {
            let Source = AT.defineType({
               typename: "Source",
               init: function() { }
            });
            let source = new Source(5);

            let Intermediary1 = AT.defineType({
               typename: "Intermediary1",
               init: function() {
                  this._def("x", 1);
               }
            });
            let intermediary1 = new Intermediary1();

            let Intermediary2 = AT.defineType({
               typename: "Intermediary2",
               init: function() {
                  this._def("x", 2);
               }
            });
            let intermediary2 = new Intermediary2();

            let Destination = AT.defineType({
               typename: "Destination",
               init: function(x) {
                  this._def("x", x);
               }
            });
            let destination = new Destination();

            AT.defineConversion(Source, Intermediary1, function(source) {
               return new Intermediary1();
            });
            AT.defineConversion(Intermediary1, Destination, function(interm1) {
               return new Destination(interm1.x);
            });

            AT.defineConversion(Source, Intermediary2, function(source) {
               return new Intermediary2();
            });
            AT.defineConversion(Intermediary2, Destination, function(interm2) {
               return new Destination(interm2.x);
            });

            assert(!AT.canConvert(Source, Destination));

            AT.defineConversionsViaIntermediary(null, Intermediary1, Destination);

            assert(source.convert(Destination).x === 1);

            // Another of the same conversion should override the previous
            AT.defineConversionsViaIntermediary(null, Intermediary2, Destination);

            assert(source.convert(Destination).x === 2);
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

            AT.defineConversion(Left, Middle, function(x) {
               return new Middle();
            });
            AT.defineConversion(Middle, Left, function(x) {
               return new Left();
            });

            // No conversions from Left <-> Right are defined yet,
            // nor are any Middle <-> Right conversions.
            assert(!left.canConvert(Right));
            assert(!right.canConvert(Left));
            assert(!middle.canConvert(Right));
            assert(!right.canConvert(Middle));

            // Now define conversions for Left <-> Middle <-> T
            // for any T where Middle <-> T exists.
            AT.defineConversionsViaIntermediary(Left, Middle, null);
            AT.defineConversionsViaIntermediary(null, Middle, Left);

            // This still shouldn't change anything just yet.
            assert(!left.canConvert(Right));
            assert(!right.canConvert(Left));
            assert(!middle.canConvert(Right));
            assert(!right.canConvert(Middle));

            // NOW, define conversion for Middle -> Right, enabling the
            // Left -> Middle -> Right conversion.
            AT.defineConversion(Middle, Right, function(x) {
               return new Right();
            });

            // This changes some of the landscape.
            assert(left.canConvert(Right));
            assert(!right.canConvert(Left));
            assert(middle.canConvert(Right));
            assert(!right.canConvert(Middle));

            // NOW, define conversion for Right -> Middle, enabling the
            // Right -> Middle -> Left conversion.
            AT.defineConversion(Right, Middle, function(x) {
               return new Right();
            });

            // And now we have all our conversions.
            assert(left.canConvert(Right));
            assert(right.canConvert(Left));
            assert(middle.canConvert(Right));
            assert(right.canConvert(Middle));
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

            AT.defineConversion(Left, Middle, function(x) {
               return new Middle();
            });
            AT.defineConversion(Middle, Left, function(x) {
               return new Left();
            });

            // Define conversions for Left <-> Middle <-> T
            // for any T where Middle <-> T exists.
            AT.defineConversionsViaIntermediary(Left, Middle, null);
            AT.defineConversionsViaIntermediary(null, Middle, Left);

            // But also define an explicit Left -> Right conversion.
            AT.defineConversion(Left, Right, function(l) {
               return new Right(l.x);
            });

            // NOW, define conversion for Middle -> Right, enabling the
            // Left -> Middle -> Right intermediary conversion.
            AT.defineConversion(Middle, Right, function(x) {
               return new Right();
            });

            assert(left.canConvert(Right));
            assert(!right.canConvert(Left));
            assert(middle.canConvert(Right));
            assert(!right.canConvert(Middle));

            // BUT we should still have our custom conversion function.
            // The implicitly created intermediary one should not have overridden it.
            assert(left.convert(Right).x === "leftValue");

            // NOW, define conversion for Right -> Middle, enabling the
            // Right -> Middle -> Left conversion.
            AT.defineConversion(Right, Middle, function(x) {
               return new Right();
            });

            // And now we have all our conversions.
            assert(left.canConvert(Right));
            assert(right.canConvert(Left));
            assert(middle.canConvert(Right));
            assert(right.canConvert(Middle));

            // This should still be custom.
            assert(left.convert(Right).x === "leftValue");
            // But the reverse should be the intermediary conversion.
            assert(right.convert(Left).x === "nothing left");
            
            // Until we define our own custom conversion for the reverse.
            AT.defineConversion(Right, Left, function(r) {
               return new Left(r.x);
            });

            // And now the custom conversion should override the intermediary one.
            assert(right.convert(Left).x === "rightValue");
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
            AT.defineConversion(Two, Three, function(x){ return new Three(x.x); });
            AT.defineConversion(Three, Four, function(x){ return new Four(x.x); });

            AT.defineConversionsViaIntermediary(null, "Three", "Four");

            // You should be able to convert downwards along the 2 -> 3 -> 4 chain now
            assert(!one.canConvert(Two)); // Still not defined
            assert(two.convert(Three).x === 2);
            assert(two.convert(Four).x === 2);
            assert(three.convert(Four).x === 3);

            // This shouldn't change anything immediately
            AT.defineConversionsViaIntermediary(null, "Two", "Three");

            assert(!one.canConvert(Two)); // Still not defined
            assert(two.convert(Three).x === 2);
            assert(two.convert(Four).x === 2);
            assert(three.convert(Four).x === 3);

            // But this should.
            AT.defineConversion(One, Two, function(x) { return new One(x.x); });
            
            // This is obvious.
            assert(one.convert(Two).x === 1); 
            // This should also have been defined by the intermediary conversion.
            assert(one.convert(Three).x === 1); 

            // This is intentional behaviour:
            assert(!one.canConvert(Four)); 
            // You could argue that you can convert 1 -> 2 -> 3 and 2 -> 3 -> 4 without
            // problem, and that thus converting 1 -> 2 -> 3 -> 4 should be allowed.
            // However, the longer the conversion path, the harder it is to tell how an
            // object got to its final type. 
            // As such, there was an intentional design decision to avoid accidentally
            // creating these long chains of conversions.
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
            assert(AT.isPrimitive(Prim));
            assert(!AT.isPrimitive(NonPrim));

            assert(prim.toPrimitive() === 6);
            assert((new Prim(prim.toPrimitive())).x === 6)
         },

         //--------------------------------------------------------------------------------
         // Test defining generic types
         function() {
            let GenericThing = AT.defineGenericType({
               typename: "GenericThing",
               init: function(x) { 
                  if (!(x instanceof this.typeParameters[0])) {
                     x = new (this.typeParameters[0])(x);
                  }
                  this._def("x", x);
               },
               customIntConstant: 35,
               customStringConstant: "Hi there",
               customMethod: function() {
                  return this.x;
               }
            });

            assert(typeof AT.GenericThing === "function");
            assert(AT.GenericThing === GenericThing);

            // Test instantiating it with a bunch of different types and initial values
            let typeValuePairs = [[AT.Float, 5.5], [AT.Int, 6], [AT.String, "Hi there"]];
            for (let i = 0; i < typeValuePairs.length; i++) {
               let ConcreteThing = GenericThing(typeValuePairs[i][0]);
               assert(ConcreteThing !== undefined);
               assert(AT.typeIsDefined(ConcreteThing));
               assert(typeof ConcreteThing === "function");

               let OtherConcreteThing = GenericThing(typeValuePairs[i][0]);
               assert(ConcreteThing === OtherConcreteThing);
               assert(ConcreteThing.prototype.typeParameters.length === 1);
               assert(ConcreteThing.prototype.typeParameters[0] === typeValuePairs[i][0]);
               
               let concreteValue = new ConcreteThing(typeValuePairs[i][1]);
               assert(concreteValue.x.toPrimitive() == typeValuePairs[i][1]);
               assert(concreteValue.typeParameters.length === 1);
               assert(concreteValue.typeParameters[0] === typeValuePairs[i][0]);
               assert(concreteValue.genericType === GenericThing);

               assert(concreteValue.customIntConstant === 35);
               assert(concreteValue.customStringConstant === "Hi there");
               assert(typeof concreteValue.customMethod === "function"
                  && concreteValue.customMethod().toPrimitive() === typeValuePairs[i][1]);
            }

            // Ensure you can't construct generic types with random other values
            function fakeConstructor(){}
            let brokenConstructors = [5, "test", console.log, fakeConstructor];
            for (let i = 0; i < brokenConstructors.length; i++) {
               disableConsoleErrors();
               let brokenThing = GenericThing(brokenConstructors[i]);
               enableConsoleErrors();
               assert(brokenThing === undefined);
            }

            // Test nested generics
            let DoubleFloatThing = GenericThing(GenericThing(AT.Float));
            assert(DoubleFloatThing !== undefined);
            assert(AT.typeIsDefined(DoubleFloatThing));
            assert(typeof DoubleFloatThing === "function");

            let doubleFloatValue = new DoubleFloatThing(7);
            assert(doubleFloatValue.x.x.value === 7);
            assert(doubleFloatValue.typeParameters.length === 1);
            assert(doubleFloatValue.typeParameters[0] === GenericThing(AT.Float));
         },

         //--------------------------------------------------------------------------------
         // Test generic type conversions between generics with the same generic type
         function() {
            let GenericThing = AT.defineGenericType({
               typename: "GenericThing",
               init: function(x) { 
                  if (!(x instanceof this.typeParameters[0])) {
                     x = new (this.typeParameters[0])(x);
                  }
                  this._def("x", x);
               },
               changeTypeParameters: function(typeParameters) {
                  return new (this.genericType(typeParameters[0]))(
                     this.x.convert(typeParameters[0]));
               }
            });

            let floatThing = new (AT.GenericThing(AT.Float))(6.28);
            assert(floatThing.x.value === 6.28);
            assert(floatThing.canConvert(AT.GenericThing(AT.Float)) // Identity conversion
               && floatThing.convert(AT.GenericThing(AT.Float)).x.value === 6.28);
            assert(floatThing.canConvert(AT.GenericThing(AT.Int))
               && floatThing.convert(AT.GenericThing(AT.Int)).x.value === 6);

            let intThing = new (AT.GenericThing(AT.Int))(42);
            assert(intThing.x.value === 42);
            assert(intThing.canConvert(AT.GenericThing(AT.Float))
               && intThing.convert(AT.GenericThing(AT.Float)).x.value === 42);

            // Test non-convertible generic types
            
            let NonConvertibleThing = AT.defineGenericType({
               typename: "NonConvertibleThing",
               init: function(x) { 
                  if (!(x instanceof this.typeParameters[0])) {
                     x = new (this.typeParameters[0])(x);
                  }
                  this._def("x", x);
               },
            });

            let nonConvertibleFloat = new (AT.NonConvertibleThing(AT.Float))(3.14);
            assert(!nonConvertibleFloat.canConvert(AT.NonConvertibleThing(AT.Int)));
            assert(!AT.canConvert(NonConvertibleThing(AT.Int), NonConvertibleThing(AT.Float)));

            // Test generic conversions for newly-defined types and conversions
            
            AT.defineType({
               typename: "A",
               init: function(str){ this._def("str", str === undefined ? "nothingA" : str); }
            });
            AT.defineType({
               typename: "B",
               init: function(str){ this._def("str", str === undefined ? "nothingB" : str); }
            });

            assert(!AT.canConvert(GenericThing(AT.A), GenericThing(AT.B)));
            assert(!AT.canConvert(GenericThing(AT.B), GenericThing(AT.A)));

            AT.defineConversion(AT.A, AT.B, function(a){ return new AT.B(a.str); });
            assert(AT.canConvert(GenericThing(AT.A), GenericThing(AT.B)));
            assert(!AT.canConvert(GenericThing(AT.B), GenericThing(AT.A)));

            AT.defineConversion(AT.B, AT.A, function(b){ return new AT.A(b.str); });
            assert(AT.canConvert(GenericThing(AT.B), GenericThing(AT.A)));

            assert((new (GenericThing(AT.A))()).convert(
               GenericThing(AT.B)).x.str === "nothingA");
            assert((new (GenericThing(AT.B))()).convert(
               GenericThing(AT.A)).x.str === "nothingB");

            // Explicitly-defined conversions between generic types overrides the default generic
            // conversion
            
            AT.defineConversion(GenericThing(AT.A), GenericThing(AT.B),
               function(nonA) {
                  return new (GenericThing(AT.B))("convertedToB");
               });
            assert((new (GenericThing(AT.A))()).convert(
               GenericThing(AT.B)).x.str === "convertedToB");
            
            AT.defineConversion(GenericThing(AT.B), GenericThing(AT.A),
               function(nonB) {
                  return new (GenericThing(AT.A))("convertedToA");
               });
            assert((new (GenericThing(AT.B))()).convert(
               GenericThing(AT.A)).x.str === "convertedToA");

            // Non-convertible generic types remain non-convertible unless you explicitly define 
            // conversions between them

            assert(!AT.canConvert(NonConvertibleThing(AT.A), NonConvertibleThing(AT.B)));
            assert(!AT.canConvert(NonConvertibleThing(AT.B), NonConvertibleThing(AT.A)));

            AT.defineConversion(NonConvertibleThing(AT.A), NonConvertibleThing(AT.B),
               function(nonA) {
                  return new (NonConvertibleThing(AT.B))("convertedToB");
               });

            assert(AT.canConvert(NonConvertibleThing(AT.A), NonConvertibleThing(AT.B)));
            assert((new (NonConvertibleThing(AT.A))()).convert(
               NonConvertibleThing(AT.B)).x.str === "convertedToB");
            assert(!AT.canConvert(NonConvertibleThing(AT.B), NonConvertibleThing(AT.A)));

            AT.defineConversion(NonConvertibleThing(AT.B), NonConvertibleThing(AT.A),
               function(nonB) {
                  return new (NonConvertibleThing(AT.A))("convertedToA");
               });

            assert(AT.canConvert(NonConvertibleThing(AT.A), NonConvertibleThing(AT.B)));
            assert(AT.canConvert(NonConvertibleThing(AT.B), NonConvertibleThing(AT.A)));
            assert((new (NonConvertibleThing(AT.B))()).convert(
               NonConvertibleThing(AT.A)).x.str === "convertedToA");
            
            // Ensure that the same rules apply to conversions via intermediaries

            AT.defineType({
               typename: "C",
               init: function(){}
            });
            AT.defineConversion(AT.B, AT.C, function(b) { return new AT.C(); });
            AT.defineConversion(AT.C, AT.B, function(c){ return new AT.B(); });

            assert(!AT.canConvert(GenericThing(AT.A), GenericThing(AT.C)));
            assert(!AT.canConvert(GenericThing(AT.C), GenericThing(AT.A)));

            AT.defineConversionsViaIntermediary(AT.A, AT.B, null);
            assert(AT.canConvert(GenericThing(AT.A), GenericThing(AT.C)));
            assert(!AT.canConvert(GenericThing(AT.C), GenericThing(AT.A)));
            
            AT.defineConversionsViaIntermediary(null, AT.B, AT.A);
            assert(AT.canConvert(GenericThing(AT.A), GenericThing(AT.C)));
            assert(AT.canConvert(GenericThing(AT.C), GenericThing(AT.A)));

            // Test error handling for the changeTypeParameters property

            disableConsoleErrors();
            let BrokenThing = AT.defineGenericType({
               typename: "BrokenThing",
               init: function(x) { 
                  if (!(x instanceof this.typeParameters[0])) {
                     x = new (this.typeParameters[0])(x);
                  }
                  this._def("x", x);
               },
               changeTypeParameters: function(typeParameters, tooManyArguments) {
                  return new (this.genericType(typeParameters[0]))(
                     this.x.convert(typeParameters[0]));
               }
            });
            enableConsoleErrors();

            assert(BrokenThing === undefined);
            assert(AT.BrokenThing === undefined);
            assert(!AT.typeIsDefined("BrokenThing"));
         },

         //--------------------------------------------------------------------------------
         // Test generic type conversions between generics and their type parameters
         function () {
            let GenericThing = AT.defineGenericType({
               typename: "GenericThing",
               init: function(x) { 
                  if (!(x instanceof this.typeParameters[0])) {
                     x = new (this.typeParameters[0])(x);
                  }
                  this._def("x", x);
               },
               convertToTypeParameter(index) {
                  return index === 0 ? this.x : undefined;
               },
               convertFromTypeParameter(index, value) {
                  return index === 0 ? new (this.type)(value) : undefined;
               }
            });

            let FloatThing = GenericThing(AT.Float);
            let floatThing = new FloatThing(5.3);
            let floatValue = new AT.Float(7.4);

            assert(AT.canConvert(FloatThing, AT.Float));
            assert(AT.canConvert(AT.Float, FloatThing));
            assert(floatThing.canConvert(AT.Float));
            assert(floatThing.convert(AT.Float).value === 5.3);
            assert(floatValue.canConvert(FloatThing));
            assert(floatValue.convert(FloatThing).x.value === 7.4);
            
            // Things that don't define conversion functions shouldn't be convertible

            let NonConvertibleThing = AT.defineGenericType({
               typename: "NonConvertibleThing",
               init: function(x) { 
                  if (!(x instanceof this.typeParameters[0])) {
                     x = new (this.typeParameters[0])(x);
                  }
                  this._def("x", x);
               }
            });

            let NonConvertibleFloat = NonConvertibleThing(AT.Float);
            let nonConvFloat = new NonConvertibleFloat(1.2);

            assert(!AT.canConvert(NonConvertibleFloat, AT.Float));
            assert(!AT.canConvert(AT.Float, NonConvertibleFloat));
            assert(!nonConvFloat.canConvert(AT.Float));
            assert(!floatValue.canConvert(NonConvertibleFloat));

            // Things that define only one conversion function should be convertible
            // only in one direction.

            let OnlyUnwrappableThing = AT.defineGenericType({
               typename: "OnlyUnwrappableThing",
               init: function(x) { 
                  if (!(x instanceof this.typeParameters[0])) {
                     x = new (this.typeParameters[0])(x);
                  }
                  this._def("x", x);
               },
               convertToTypeParameter(index) {
                  return index === 0 ? this.x : undefined;
               }
            });

            let OnlyUnwrappableFloat = OnlyUnwrappableThing(AT.Float);
            let unwrappableFloat = new OnlyUnwrappableFloat(7.8);

            assert(AT.canConvert(OnlyUnwrappableFloat, AT.Float));
            assert(!AT.canConvert(AT.Float, OnlyUnwrappableFloat));
            assert(unwrappableFloat.canConvert(AT.Float));
            assert(unwrappableFloat.convert(AT.Float).value === 7.8)
            assert(!floatValue.canConvert(OnlyUnwrappableFloat));
            
            let OnlyWrappableThing = AT.defineGenericType({
               typename: "OnlyWrappableThing",
               init: function(x) { 
                  if (!(x instanceof this.typeParameters[0])) {
                     x = new (this.typeParameters[0])(x);
                  }
                  this._def("x", x);
               },
               convertFromTypeParameter(index, value) {
                  return index === 0 ? new (this.type)(value) : undefined;
               }
            });

            let OnlyWrappableFloat = OnlyWrappableThing(AT.Float);
            let wrappableFloat = new OnlyWrappableFloat(9.8);

            assert(!AT.canConvert(OnlyWrappableFloat, AT.Float));
            assert(AT.canConvert(AT.Float, OnlyWrappableFloat));
            assert(!wrappableFloat.canConvert(AT.Float));
            assert(floatValue.canConvert(OnlyWrappableFloat));
            assert(floatValue.convert(OnlyWrappableFloat).x.value === 7.4);

            // Test incorrect definitions of convertible types (should give error)

            disableConsoleErrors();
            let BrokenThing = AT.defineGenericType({
               typename: "BrokenThing",
               init: function(x) { 
                  if (!(x instanceof this.typeParameters[0])) {
                     x = new (this.typeParameters[0])(x);
                  }
                  this._def("x", x);
               },
               convertToTypeParameter(index, broken) {
                  return index === 0 ? this.x : undefined;
               }
            });
            enableConsoleErrors();

            assert(!BrokenThing);
            assert(!AT.BrokenThing);
            assert(!AT.typeIsDefined("BrokenThing"));

            disableConsoleErrors();
            BrokenThing = AT.defineGenericType({
               typename: "BrokenThing",
               init: function(x) { 
                  if (!(x instanceof this.typeParameters[0])) {
                     x = new (this.typeParameters[0])(x);
                  }
                  this._def("x", x);
               },
               convertFromTypeParameter(index) {
                  return undefined;
               }
            });
            enableConsoleErrors();

            assert(!BrokenThing);
            assert(!AT.BrokenThing);
            assert(!AT.typeIsDefined("BrokenThing"));
            
            // Test restrictions on conversion
            
            // Types that provide no restrictions should return true for any type parameter that
            // it contains.
            assert(floatThing.canConvertToTypeParameter(0));
            assert(!floatThing.canConvertToTypeParameter(1));
            assert(floatThing.canConvertFromTypeParameter(0));
            assert(!floatThing.canConvertFromTypeParameter(1));

            // Types that provide no conversion functions should return false for all these
            // canConvert... functions.
            assert(!nonConvFloat.canConvertToTypeParameter(0));
            assert(!nonConvFloat.canConvertToTypeParameter(1));
            assert(!nonConvFloat.canConvertFromTypeParameter(0));
            assert(!nonConvFloat.canConvertFromTypeParameter(1));

            // Otherwise, types can define their own restrictions on type parameter conversion.

            let GenericPair = AT.defineGenericType({
               typename: "GenericPair",
               init: function(x, y) { 
                  if (!(x instanceof this.typeParameters[0])) {
                     x = new (this.typeParameters[0])(x);
                  }
                  this._def("x", x);
                  if (!(y instanceof this.typeParameters[1])) {
                     y = new (this.typeParameters[1])(y);
                  }
                  this._def("y", y);
               },
               canConvertToTypeParameter(index) {
                  return index === 1;
               },
               convertToTypeParameter(index) {
                  return this.y;
               },
               canConvertFromTypeParameter(index) {
                  return index === 0;
               },
               convertFromTypeParameter(index, value) {
                  return new (this.type)(value, value.convert(this.typeParameters[1]));
               }
            });

            assert(GenericPair);

            let A = AT.defineType({
               typename: "A",
               init: function(x) { this._def("x", x); }
            });
            
            let B = AT.defineType({
               typename: "B",
               init: function(x) { this._def("x", x); }
            });
            AT.defineConversion(A, B, function(a) {
               return new B(a.x);
            });
            AT.defineConversion(B, A, function(b) {
               return new A(b.x);
            });

            let ABPair = GenericPair(AT.A, AT.B);
            let abPair = new ABPair(4.5, 7.6);

            assert(!abPair.canConvertToTypeParameter(0));
            assert(abPair.canConvertToTypeParameter(1));
            assert(abPair.canConvertFromTypeParameter(0));
            assert(!abPair.canConvertFromTypeParameter(1));

            assert(!AT.canConvert(ABPair, AT.A));
            assert(AT.canConvert(ABPair, AT.B));
            assert(AT.canConvert(AT.A, ABPair));
            assert(!AT.canConvert(AT.B, ABPair));

            assert(abPair.convert(AT.B).x === 7.6);
            let convertedPair = (new AT.A(4.5)).convert(ABPair);
            assert(convertedPair !== undefined
               && convertedPair.x.x === 4.5
               && convertedPair.y.x === 4.5);

            // Allow overriding of conversion
            AT.defineConversion(ABPair, A, function(pair) {
               return new A(75);
            });

            assert(abPair.convert(A).x === 75);

            AT.defineConversion(ABPair, B, function(pair) {
               return new B(56);
            });

            assert(abPair.convert(B).x === 56);

            AT.defineConversion(A, ABPair, function(a) {
               return new ABPair(6, 7);
            });

            let convertedPair2 = (new AT.A(4.5)).convert(ABPair);
            assert(convertedPair2 !== undefined
               && convertedPair2.x.x === 6
               && convertedPair2.y.x === 7);

            // Ensure these overridden conversions don't affect other instances of this generic
            // type
            let FloatIntPair = GenericPair(AT.Float, AT.Int);
            let floatIntPair = new FloatIntPair(2.3, 4);
            assert(floatIntPair.convert(AT.Int).value === 4);
            
            // TODO: should convert(To|From)TypeParameter(n) call the overridden conversion?
            // If so, should the corresponding canConvert functions call AT.canConvert?
         },

         //--------------------------------------------------------------------------------
         // Test vector3 type
         function() {
            let a = new AT.Vector3(3, 4, 5);
            assert(a.x === 3 && a.y === 4 && a.z === 5);

            let b = new AT.Vector3([4, 5, 6]);
            assert(b.x === 4 && b.y === 5 && b.z === 6);

            let c = new AT.Vector3();
            assert(c.x === 0 && c.y === 0 && c.z === 0);

            let d = new AT.Vector3(6);
            assert(d.x === 6 && d.y === 0 && d.z === 0);

         },

         //--------------------------------------------------------------------------------
         // Test array type
         function() {
            assert(typeof AT.Array === "function");
            assert(typeof AT.Array(AT.Float) === "function");

            let FloatArray = AT.Array(AT.Float);
            let floatArray = new FloatArray([1.2, 3.4, 5.6]);
            assert(floatArray.get(0).value === 1.2);
            assert(floatArray.get(1).value === 3.4);
            assert(floatArray.get(2).value === 5.6);

            assert(floatArray.isPrimitive());
            assert(arraysEqual(floatArray.toPrimitive(), [1.2, 3.4, 5.6]));

            let StringArray = AT.Array(AT.String);
            let stringArray = new StringArray("a", "b", 65);
            assert(stringArray.get(0).value === "a");
            assert(stringArray.get(1).value === "b");
            assert(stringArray.get(2).value === "65");

            let smallerArray = new FloatArray(2, 3);
            let vec3 = smallerArray.convert(AT.Vector3);
            assert(vec3.x === 2);
            assert(vec3.y === 3);
            assert(vec3.z === 0);
            smallerArray = vec3.convert(AT.Array(AT.Float));
            assert(smallerArray.get(0).value === 2);
            assert(smallerArray.get(1).value === 3);
            assert(smallerArray.get(2).value === 0);

            let IntArray = AT.Array(AT.Int);
            assert(AT.canConvert(FloatArray, IntArray));
            let intArray = floatArray.convert(IntArray);
            assert(intArray.get(0).value === 1);
            assert(intArray.get(1).value === 3);
            assert(intArray.get(2).value === 6);
            assert(arraysEqual(intArray.toPrimitive(), [1, 3, 6]));
            let intVec3 = intArray.convert(AT.Vector3);
            assert(intVec3.x === 1);
            assert(intVec3.y === 3);
            assert(intVec3.z === 6);
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

      function assertThrows(errorType, callback) {
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
         assert(errorThrown);
      }

      var defaultError = console.error;

      function disableConsoleErrors() {
         console.error = function(){};
      }
      function enableConsoleErrors() {
         console.error = defaultError;
      }

      // Convenience function for comparing two flat arrays of simple values
      function arraysEqual(a, b) {
         if (a.length !== b.length) { return false; }
         for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) { return false; }
         }
         return true;
      }
      

      for (let i = 0; i < tests.length; i++) {
         // Ensure the tests use a fresh, clean AT module with no definitions from the other
         // tests.
         AT = window.AT._createTestingModule();

         tests[i]();

         enableConsoleErrors(); // Just in case the previous tests forgot to re-enable them.
      }

      return testsPassed;
   }

   return T;
})()
