"use strict";

// Add any new test functions to this array.
// Each should be a function that takes in no arguments.
// Each function gets a "clean" version of the Atypical type system, with only basic types
// defined, via the AT variable. This variable gets reset after every test.
window.AtypicalTests = [

   //--------------------------------------------------------------------------------
   // Test that defining types works
   function () {
      let Test1 = AT.defineType({
         typename: "Test1",
         init: function(x) {
            this._set("thing", x);
         },
         dummyname: "dummyvalue",
         getDummy: function() { return this.dummyname; }
      });
      T.assert(Test1);
      T.assert(AT.Test1);
      T.assert(AT.typeIsDefined("Test1"));
      T.assert(AT.typeIsDefined(Test1));
      T.assert(!AT.typeIsDefined("Test2"));

      let test1 = new AT.Test1(456);

      T.assert(test1.dummyname === "dummyvalue");
      T.assert(test1.getDummy() === "dummyvalue");
      T.assert(test1.thing === 456);
      T.assert(test1.type === Test1);
      T.assert(test1.type.name === "Test1");
   },

   //--------------------------------------------------------------------------------
   // Test that defining duplicate types does not work
   function () {
      let Test1 = AT.defineType({
         typename: "Test1",
         init: function(){}
      });
      T.assert(Test1);
      T.assert(AT.typeIsDefined("Test1"));

      T.disableConsoleErrors();
      let Test1Duplicate = AT.defineType({
         typename: "Test1",
         init: function(){}
      });
      T.enableConsoleErrors();
      T.assert(!Test1Duplicate);
      T.assert(AT.typeIsDefined("Test1"));
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
         T.assert(MyCoolType !== undefined);
         T.assert(AT.hasOwnProperty(workingTestNames[i]));
         T.assert(AT.typeIsDefined(workingTestNames[i]));
         T.assert(AT.typeIsDefined(MyCoolType));
         T.assert(MyCoolType === AT.typeNamed(workingTestNames[i]));
         T.assert(MyCoolType === AT[workingTestNames[i]]);
         T.assert(MyCoolType.name === workingTestNames[i]);
      }
   },

   //--------------------------------------------------------------------------------
   // Test that type names have proper validation
   function () {
      let brokenTestnames = ["Test Type", "Test-Type", "3TestType", "Test<Type",
         "TestType ", " TestType", "$TestType", "Test$Type"];

      for (let i = 0; i < brokenTestnames.length; i++) {
         T.disableConsoleErrors();
         let Test = AT.defineType({
            typename: brokenTestnames[i],
            init: function(){}
         });
         T.enableConsoleErrors();
         T.assert(Test === undefined);
         T.assert(AT[brokenTestnames[i]] === undefined);
      }
   },

   //--------------------------------------------------------------------------------
   // Test that you can't define types with the same name as a built-in function
   // in Object.prototype or previously-defined Atypical functions
   function () {
      let brokenTestnames = ["isPrototypeOf", "hasOwnProperty", "valueOf", "defineType",
         "typeIsDefined", "isPrimitive", "canConvert", "Type"];

      for (let i = 0; i < brokenTestnames.length; i++) {
         T.disableConsoleErrors();
         let Test = AT.defineType({
            typename: brokenTestnames[i],
            init: function(){}
         });
         T.enableConsoleErrors();
         T.assert(Test === undefined);
      }
   },

   //--------------------------------------------------------------------------------
   // Test that basic conversions work
   function() {
      let Test1 = AT.defineType({
         typename: "Test1",
         init: function(x) { this._set("x", x); }
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

      T.assert(AT.canConvert(Test1, Test2));
      T.assert(test1.canConvert(Test2));

      T.assert(!AT.canConvert(Test1, Test3));
      T.assert(!test1.canConvert(Test3));

      T.assert(AT.canConvert(Test1, Test1));
      T.assert(test1.convert(Test1).x === 56);

      // Conversions are not bidirectional by default
      T.assert(!AT.canConvert(Test2, Test1));
      T.assert(!test2.canConvert(Test1));
   },

   //--------------------------------------------------------------------------------
   // Test that definite conversions via intermediaries work
   function() {
      let Source = AT.defineType({
         typename: "Source",
         init: function(x) {
            this._set("x", x);
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
            this._set("y", y);
         }
      });
      let destination = new Destination();

      AT.defineConversion(Source, Intermediary, function(x) {
         return new Intermediary();
      });
      AT.defineConversion(Intermediary, Destination, function(x) {
         return new Destination();
      });

      T.assert(!AT.canConvert(Source, Destination));

      AT.defineConversionsViaIntermediary(Source, Intermediary, Destination);

      T.assert(AT.canConvert(Source, Destination));
      T.assert(source.canConvert(Destination));
      T.assert(source.convert(Destination).y === 0);

      // Ensure you can still override intermediary conversions if need be
      AT.defineConversion(Source, Destination, function(s) {
         return new Destination(s.x);
      });
      T.assert(source.convert(Destination).y === 5);
   },

   //--------------------------------------------------------------------------------
   // Test that indefinite conversions via intermediaries, to any destination, work
   function() {
      let Source = AT.defineType({
         typename: "Source",
         init: function(x) {
            this._set("x", x);
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
            this._set("y", y);
         }
      });
      let destination = new Destination();

      AT.defineConversion(Source, Intermediary, function(x) {
         return new Intermediary();
      });
      AT.defineConversion(Intermediary, Destination, function(x) {
         return new Destination();
      });

      T.assert(!AT.canConvert(Source, Destination));

      AT.defineConversionsViaIntermediary(Source, Intermediary, null);

      T.assert(AT.canConvert(Source, Destination));
      T.assert(source.canConvert(Destination));
      T.assert(source.convert(Destination).y === 0);

      // Ensure you can still override intermediary conversions if need be
      AT.defineConversion(Source, Destination, function(s) {
         return new Destination(s.x);
      });
      T.assert(source.convert(Destination).y === 5);
   },

   //--------------------------------------------------------------------------------
   // Test that indefinite conversions via intermediaries, from any source, work
   function() {
      let Source = AT.defineType({
         typename: "Source",
         init: function(x) {
            this._set("x", x);
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
            this._set("y", y);
         }
      });
      let destination = new Destination();

      AT.defineConversion(Source, Intermediary, function(x) {
         return new Intermediary();
      });
      AT.defineConversion(Intermediary, Destination, function(x) {
         return new Destination();
      });

      T.assert(!AT.canConvert(Source, Destination));

      AT.defineConversionsViaIntermediary(null, Intermediary, Destination);

      T.assert(AT.canConvert(Source, Destination));
      T.assert(source.canConvert(Destination));
      T.assert(source.convert(Destination).y === 0);

      // Ensure you can still override intermediary conversions if need be
      AT.defineConversion(Source, Destination, function(s) {
         return new Destination(s.x);
      });
      T.assert(source.convert(Destination).y === 5);
   },

   //--------------------------------------------------------------------------------
   // Ensure that broad intermediary conversions can't override explicit conversions
   function() {
      let Source = AT.defineType({
         typename: "Source",
         init: function(x) {
            this._set("x", x);
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
            this._set("y", y);
         }
      });
      let destination = new Destination();

      AT.defineConversion(Source, Intermediary, function(x) {
         return new Intermediary();
      });
      AT.defineConversion(Intermediary, Destination, function(x) {
         return new Destination();
      });

      T.assert(!AT.canConvert(Source, Destination));

      AT.defineConversion(Source, Destination, function(s) {
         return new Destination(s.x);
      });

      T.assert(AT.canConvert(Source, Destination));
      T.assert(source.canConvert(Destination));
      T.assert(source.convert(Destination).y === 5);

      AT.defineConversionsViaIntermediary(null, Intermediary, Destination);

      // Previous conversion should be preserved.
      T.assert(source.convert(Destination).y === 5);

      // However, a narrow intermediary conversion should override the previous conversion.
      AT.defineConversionsViaIntermediary(Source, Intermediary, Destination);
      T.assert(source.convert(Destination).y === 0);
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
            this._set("x", 1);
         }
      });
      let intermediary1 = new Intermediary1();

      let Intermediary2 = AT.defineType({
         typename: "Intermediary2",
         init: function() {
            this._set("x", 2);
         }
      });
      let intermediary2 = new Intermediary2();

      let Destination = AT.defineType({
         typename: "Destination",
         init: function(x) {
            this._set("x", x);
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

      T.assert(!AT.canConvert(Source, Destination));

      AT.defineConversionsViaIntermediary(null, Intermediary1, Destination);

      T.assert(source.convert(Destination).x === 1);

      // Another of the same conversion should override the previous
      AT.defineConversionsViaIntermediary(null, Intermediary2, Destination);

      T.assert(source.convert(Destination).x === 2);
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
      T.assert(!left.canConvert(Right));
      T.assert(!right.canConvert(Left));
      T.assert(!middle.canConvert(Right));
      T.assert(!right.canConvert(Middle));

      // Now define conversions for Left <-> Middle <-> T
      // for any T where Middle <-> T exists.
      AT.defineConversionsViaIntermediary(Left, Middle, null);
      AT.defineConversionsViaIntermediary(null, Middle, Left);

      // This still shouldn't change anything just yet.
      T.assert(!left.canConvert(Right));
      T.assert(!right.canConvert(Left));
      T.assert(!middle.canConvert(Right));
      T.assert(!right.canConvert(Middle));

      // NOW, define conversion for Middle -> Right, enabling the
      // Left -> Middle -> Right conversion.
      AT.defineConversion(Middle, Right, function(x) {
         return new Right();
      });

      // This changes some of the landscape.
      T.assert(left.canConvert(Right));
      T.assert(!right.canConvert(Left));
      T.assert(middle.canConvert(Right));
      T.assert(!right.canConvert(Middle));

      // NOW, define conversion for Right -> Middle, enabling the
      // Right -> Middle -> Left conversion.
      AT.defineConversion(Right, Middle, function(x) {
         return new Right();
      });

      // And now we have all our conversions.
      T.assert(left.canConvert(Right));
      T.assert(right.canConvert(Left));
      T.assert(middle.canConvert(Right));
      T.assert(right.canConvert(Middle));
   },

   //--------------------------------------------------------------------------------
   // Ensure implicit intermediary conversions don't override previously-specified definite
   // conversions.
   function() {
      let Left = AT.defineType({
         typename: "Left",
         init: function(x) {
            this._set("x", x ? x : "nothing left");
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
            this._set("x", x ? x : "nothing right");
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

      T.assert(left.canConvert(Right));
      T.assert(!right.canConvert(Left));
      T.assert(middle.canConvert(Right));
      T.assert(!right.canConvert(Middle));

      // BUT we should still have our custom conversion function.
      // The implicitly created intermediary one should not have overridden it.
      T.assert(left.convert(Right).x === "leftValue");

      // NOW, define conversion for Right -> Middle, enabling the
      // Right -> Middle -> Left conversion.
      AT.defineConversion(Right, Middle, function(x) {
         return new Right();
      });

      // And now we have all our conversions.
      T.assert(left.canConvert(Right));
      T.assert(right.canConvert(Left));
      T.assert(middle.canConvert(Right));
      T.assert(right.canConvert(Middle));

      // This should still be custom.
      T.assert(left.convert(Right).x === "leftValue");
      // But the reverse should be the intermediary conversion.
      T.assert(right.convert(Left).x === "nothing left");

      // Until we define our own custom conversion for the reverse.
      AT.defineConversion(Right, Left, function(r) {
         return new Left(r.x);
      });

      // And now the custom conversion should override the intermediary one.
      T.assert(right.convert(Left).x === "rightValue");
   },

   //--------------------------------------------------------------------------------
   // Test chained, implicit intermediary conversions
   function() {
      let One = AT.defineType({
         typename: "One",
         init: function(x) { this._set("x", x); }
      });
      let one = new One(1);

      let Two = AT.defineType({
         typename: "Two",
         init: function(x) { this._set("x", x); }
      });
      let two = new Two(2);

      let Three = AT.defineType({
         typename: "Three",
         init: function(x) { this._set("x", x); }
      });
      let three = new Three(3);

      let Four = AT.defineType({
         typename: "Four",
         init: function(x) { this._set("x", x); }
      });
      let four = new Four(4);

      // Define conversions 2 -> 3 -> 4
      AT.defineConversion(Two, Three, function(x){ return new Three(x.x); });
      AT.defineConversion(Three, Four, function(x){ return new Four(x.x); });

      AT.defineConversionsViaIntermediary(null, "Three", "Four");

      // You should be able to convert downwards along the 2 -> 3 -> 4 chain now
      T.assert(!one.canConvert(Two)); // Still not defined
      T.assert(two.convert(Three).x === 2);
      T.assert(two.convert(Four).x === 2);
      T.assert(three.convert(Four).x === 3);

      // This shouldn't change anything immediately
      AT.defineConversionsViaIntermediary(null, "Two", "Three");

      T.assert(!one.canConvert(Two)); // Still not defined
      T.assert(two.convert(Three).x === 2);
      T.assert(two.convert(Four).x === 2);
      T.assert(three.convert(Four).x === 3);

      // But this should.
      AT.defineConversion(One, Two, function(x) { return new One(x.x); });

      // This is obvious.
      T.assert(one.convert(Two).x === 1); 
      // This should also have been defined by the intermediary conversion.
      T.assert(one.convert(Three).x === 1); 

      // This is intentional behaviour:
      T.assert(!one.canConvert(Four)); 
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
         init: function(x) { this._set("x", x); },
         toPrimitive: function() { return this.x; }
      });
      let prim = new Prim(6);


      let NonPrim = AT.defineType({
         typename: "NonPrim",
         init: function(y) { this._set("y", y); },
      });
      let nonPrim = new NonPrim(17);

      T.assert(prim.isPrimitive());
      T.assert(!nonPrim.isPrimitive());
      T.assert(AT.isPrimitive(Prim));
      T.assert(!AT.isPrimitive(NonPrim));

      T.assert(prim.toPrimitive() === 6);
      T.assert((new Prim(prim.toPrimitive())).x === 6)
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
            this._set("x", x);
         },
         customIntConstant: 35,
         customStringConstant: "Hi there",
         customMethod: function() {
            return this.x;
         }
      });

      T.assert(typeof AT.GenericThing === "function");
      T.assert(AT.GenericThing === GenericThing);
      T.assert(AT.GenericThing.name === "GenericThing");

      // Test instantiating it with a bunch of different types and initial values
      let typeValuePairs = [[AT.Float, 5.5], [AT.Int, 6], [AT.String, "Hi there"]];
      for (let i = 0; i < typeValuePairs.length; i++) {
         let ConcreteThing = GenericThing(typeValuePairs[i][0]);
         T.assert(ConcreteThing !== undefined);
         T.assert(AT.typeIsDefined(ConcreteThing));
         T.assert(typeof ConcreteThing === "function");

         let OtherConcreteThing = GenericThing(typeValuePairs[i][0]);
         T.assert(ConcreteThing === OtherConcreteThing);
         T.assert(ConcreteThing.prototype.typeParameters.length === 1);
         T.assert(ConcreteThing.prototype.typeParameters[0] === typeValuePairs[i][0]);

         let concreteValue = new ConcreteThing(typeValuePairs[i][1]);
         T.assert(concreteValue.x.toPrimitive() == typeValuePairs[i][1]);
         T.assert(concreteValue.typeParameters.length === 1);
         T.assert(concreteValue.typeParameters[0] === typeValuePairs[i][0]);
         T.assert(concreteValue.genericType === GenericThing);

         T.assert(concreteValue.customIntConstant === 35);
         T.assert(concreteValue.customStringConstant === "Hi there");
         T.assert(typeof concreteValue.customMethod === "function"
            && concreteValue.customMethod().toPrimitive() === typeValuePairs[i][1]);
      }

      // Ensure you can't construct generic types with random other values
      function fakeConstructor(){}
      let brokenConstructors = [5, "test", console.log, fakeConstructor];
      for (let i = 0; i < brokenConstructors.length; i++) {
         T.disableConsoleErrors();
         let brokenThing = GenericThing(brokenConstructors[i]);
         T.enableConsoleErrors();
         T.assert(brokenThing === undefined);
      }

      // Test nested generics
      let DoubleFloatThing = GenericThing(GenericThing(AT.Float));
      T.assert(DoubleFloatThing !== undefined);
      T.assert(AT.typeIsDefined(DoubleFloatThing));
      T.assert(typeof DoubleFloatThing === "function");

      let doubleFloatValue = new DoubleFloatThing(7);
      T.assert(doubleFloatValue.x.x.value === 7);
      T.assert(doubleFloatValue.typeParameters.length === 1);
      T.assert(doubleFloatValue.typeParameters[0] === GenericThing(AT.Float));
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
            this._set("x", x);
         },
         changeTypeParameters: function(typeParameters) {
            return new (this.genericType(typeParameters[0]))(
               this.x.convert(typeParameters[0]));
         }
      });

      let floatThing = new (AT.GenericThing(AT.Float))(6.28);
      T.assert(floatThing.x.value === 6.28);
      T.assert(floatThing.canConvert(AT.GenericThing(AT.Float)) // Identity conversion
         && floatThing.convert(AT.GenericThing(AT.Float)).x.value === 6.28);
      T.assert(floatThing.canConvert(AT.GenericThing(AT.Int))
         && floatThing.convert(AT.GenericThing(AT.Int)).x.value === 6);

      let intThing = new (AT.GenericThing(AT.Int))(42);
      T.assert(intThing.x.value === 42);
      T.assert(intThing.canConvert(AT.GenericThing(AT.Float))
         && intThing.convert(AT.GenericThing(AT.Float)).x.value === 42);

      // Test non-convertible generic types

      let NonConvertibleThing = AT.defineGenericType({
         typename: "NonConvertibleThing",
         init: function(x) { 
            if (!(x instanceof this.typeParameters[0])) {
               x = new (this.typeParameters[0])(x);
            }
            this._set("x", x);
         },
      });

      let nonConvertibleFloat = new (AT.NonConvertibleThing(AT.Float))(3.14);
      T.assert(!nonConvertibleFloat.canConvert(AT.NonConvertibleThing(AT.Int)));
      T.assert(!AT.canConvert(NonConvertibleThing(AT.Int), NonConvertibleThing(AT.Float)));

      // Test generic conversions for newly-defined types and conversions

      AT.defineType({
         typename: "A",
         init: function(str){ this._set("str", str === undefined ? "nothingA" : str); }
      });
      AT.defineType({
         typename: "B",
         init: function(str){ this._set("str", str === undefined ? "nothingB" : str); }
      });

      T.assert(!AT.canConvert(GenericThing(AT.A), GenericThing(AT.B)));
      T.assert(!AT.canConvert(GenericThing(AT.B), GenericThing(AT.A)));

      AT.defineConversion(AT.A, AT.B, function(a){ return new AT.B(a.str); });
      T.assert(AT.canConvert(GenericThing(AT.A), GenericThing(AT.B)));
      T.assert(!AT.canConvert(GenericThing(AT.B), GenericThing(AT.A)));

      AT.defineConversion(AT.B, AT.A, function(b){ return new AT.A(b.str); });
      T.assert(AT.canConvert(GenericThing(AT.B), GenericThing(AT.A)));

      T.assert((new (GenericThing(AT.A))()).convert(
         GenericThing(AT.B)).x.str === "nothingA");
      T.assert((new (GenericThing(AT.B))()).convert(
         GenericThing(AT.A)).x.str === "nothingB");

      // Explicitly-defined conversions between generic types overrides the default generic
      // conversion

      AT.defineConversion(GenericThing(AT.A), GenericThing(AT.B),
         function(nonA) {
            return new (GenericThing(AT.B))("convertedToB");
         });
      T.assert((new (GenericThing(AT.A))()).convert(
         GenericThing(AT.B)).x.str === "convertedToB");

      AT.defineConversion(GenericThing(AT.B), GenericThing(AT.A),
         function(nonB) {
            return new (GenericThing(AT.A))("convertedToA");
         });
      T.assert((new (GenericThing(AT.B))()).convert(
         GenericThing(AT.A)).x.str === "convertedToA");

      // Non-convertible generic types remain non-convertible unless you explicitly define 
      // conversions between them

      T.assert(!AT.canConvert(NonConvertibleThing(AT.A), NonConvertibleThing(AT.B)));
      T.assert(!AT.canConvert(NonConvertibleThing(AT.B), NonConvertibleThing(AT.A)));

      AT.defineConversion(NonConvertibleThing(AT.A), NonConvertibleThing(AT.B),
         function(nonA) {
            return new (NonConvertibleThing(AT.B))("convertedToB");
         });

      T.assert(AT.canConvert(NonConvertibleThing(AT.A), NonConvertibleThing(AT.B)));
      T.assert((new (NonConvertibleThing(AT.A))()).convert(
         NonConvertibleThing(AT.B)).x.str === "convertedToB");
      T.assert(!AT.canConvert(NonConvertibleThing(AT.B), NonConvertibleThing(AT.A)));

      AT.defineConversion(NonConvertibleThing(AT.B), NonConvertibleThing(AT.A),
         function(nonB) {
            return new (NonConvertibleThing(AT.A))("convertedToA");
         });

      T.assert(AT.canConvert(NonConvertibleThing(AT.A), NonConvertibleThing(AT.B)));
      T.assert(AT.canConvert(NonConvertibleThing(AT.B), NonConvertibleThing(AT.A)));
      T.assert((new (NonConvertibleThing(AT.B))()).convert(
         NonConvertibleThing(AT.A)).x.str === "convertedToA");

      // Ensure that the same rules apply to conversions via intermediaries

      AT.defineType({
         typename: "C",
         init: function(){}
      });
      AT.defineConversion(AT.B, AT.C, function(b) { return new AT.C(); });
      AT.defineConversion(AT.C, AT.B, function(c){ return new AT.B(); });

      T.assert(!AT.canConvert(GenericThing(AT.A), GenericThing(AT.C)));
      T.assert(!AT.canConvert(GenericThing(AT.C), GenericThing(AT.A)));

      AT.defineConversionsViaIntermediary(AT.A, AT.B, null);
      T.assert(AT.canConvert(GenericThing(AT.A), GenericThing(AT.C)));
      T.assert(!AT.canConvert(GenericThing(AT.C), GenericThing(AT.A)));

      AT.defineConversionsViaIntermediary(null, AT.B, AT.A);
      T.assert(AT.canConvert(GenericThing(AT.A), GenericThing(AT.C)));
      T.assert(AT.canConvert(GenericThing(AT.C), GenericThing(AT.A)));

      // Test error handling for the changeTypeParameters property

      T.disableConsoleErrors();
      let BrokenThing = AT.defineGenericType({
         typename: "BrokenThing",
         init: function(x) { 
            if (!(x instanceof this.typeParameters[0])) {
               x = new (this.typeParameters[0])(x);
            }
            this._set("x", x);
         },
         changeTypeParameters: function(typeParameters, tooManyArguments) {
            return new (this.genericType(typeParameters[0]))(
               this.x.convert(typeParameters[0]));
         }
      });
      T.enableConsoleErrors();

      T.assert(BrokenThing === undefined);
      T.assert(AT.BrokenThing === undefined);
      T.assert(!AT.typeIsDefined("BrokenThing"));

      // Nested generics should also be convertible
      let DoubleA = GenericThing(GenericThing(AT.A));
      let DoubleB = GenericThing(GenericThing(AT.B));
      T.assert(AT.canConvert(DoubleA, DoubleB));
      let dubA = new DoubleA();
      T.assert(dubA.canConvert(DoubleB));
      T.assert(dubA.convert(DoubleB).x.x.str === "convertedToB");
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
            this._set("x", x);
         },
         convertToTypeParameter(index) {
            return index === 0 ? this.x : undefined;
         },
         convertFromTypeParameter(index, value) {
            return index === 0 ? new this.type(value) : undefined;
         }
      });

      let FloatThing = GenericThing(AT.Float);
      let floatThing = new FloatThing(5.3);
      let floatValue = new AT.Float(7.4);

      T.assert(AT.canConvert(FloatThing, AT.Float));
      T.assert(AT.canConvert(AT.Float, FloatThing));
      T.assert(floatThing.canConvert(AT.Float));
      T.assert(floatThing.convert(AT.Float).value === 5.3);
      T.assert(floatValue.canConvert(FloatThing));
      T.assert(floatValue.convert(FloatThing).x.value === 7.4);

      // Things that don't define conversion functions shouldn't be convertible

      let NonConvertibleThing = AT.defineGenericType({
         typename: "NonConvertibleThing",
         init: function(x) { 
            if (!(x instanceof this.typeParameters[0])) {
               x = new (this.typeParameters[0])(x);
            }
            this._set("x", x);
         }
      });

      let NonConvertibleFloat = NonConvertibleThing(AT.Float);
      let nonConvFloat = new NonConvertibleFloat(1.2);

      T.assert(!AT.canConvert(NonConvertibleFloat, AT.Float));
      T.assert(!AT.canConvert(AT.Float, NonConvertibleFloat));
      T.assert(!nonConvFloat.canConvert(AT.Float));
      T.assert(!floatValue.canConvert(NonConvertibleFloat));

      // Things that define only one conversion function should be convertible
      // only in one direction.

      let OnlyUnwrappableThing = AT.defineGenericType({
         typename: "OnlyUnwrappableThing",
         init: function(x) { 
            if (!(x instanceof this.typeParameters[0])) {
               x = new (this.typeParameters[0])(x);
            }
            this._set("x", x);
         },
         convertToTypeParameter(index) {
            return index === 0 ? this.x : undefined;
         }
      });

      let OnlyUnwrappableFloat = OnlyUnwrappableThing(AT.Float);
      let unwrappableFloat = new OnlyUnwrappableFloat(7.8);

      T.assert(AT.canConvert(OnlyUnwrappableFloat, AT.Float));
      T.assert(!AT.canConvert(AT.Float, OnlyUnwrappableFloat));
      T.assert(unwrappableFloat.canConvert(AT.Float));
      T.assert(unwrappableFloat.convert(AT.Float).value === 7.8)
      T.assert(!floatValue.canConvert(OnlyUnwrappableFloat));

      let OnlyWrappableThing = AT.defineGenericType({
         typename: "OnlyWrappableThing",
         init: function(x) { 
            if (!(x instanceof this.typeParameters[0])) {
               x = new (this.typeParameters[0])(x);
            }
            this._set("x", x);
         },
         convertFromTypeParameter(index, value) {
            return index === 0 ? new this.type(value) : undefined;
         }
      });

      let OnlyWrappableFloat = OnlyWrappableThing(AT.Float);
      let wrappableFloat = new OnlyWrappableFloat(9.8);

      T.assert(!AT.canConvert(OnlyWrappableFloat, AT.Float));
      T.assert(AT.canConvert(AT.Float, OnlyWrappableFloat));
      T.assert(!wrappableFloat.canConvert(AT.Float));
      T.assert(floatValue.canConvert(OnlyWrappableFloat));
      T.assert(floatValue.convert(OnlyWrappableFloat).x.value === 7.4);

      // Test incorrect definitions of convertible types (should give error)

      T.disableConsoleErrors();
      let BrokenThing = AT.defineGenericType({
         typename: "BrokenThing",
         init: function(x) { 
            if (!(x instanceof this.typeParameters[0])) {
               x = new (this.typeParameters[0])(x);
            }
            this._set("x", x);
         },
         convertToTypeParameter(index, broken) {
            return index === 0 ? this.x : undefined;
         }
      });
      T.enableConsoleErrors();

      T.assert(!BrokenThing);
      T.assert(!AT.BrokenThing);
      T.assert(!AT.typeIsDefined("BrokenThing"));

      T.disableConsoleErrors();
      BrokenThing = AT.defineGenericType({
         typename: "BrokenThing",
         init: function(x) { 
            if (!(x instanceof this.typeParameters[0])) {
               x = new (this.typeParameters[0])(x);
            }
            this._set("x", x);
         },
         convertFromTypeParameter(index) {
            return undefined;
         }
      });
      T.enableConsoleErrors();

      T.assert(!BrokenThing);
      T.assert(!AT.BrokenThing);
      T.assert(!AT.typeIsDefined("BrokenThing"));

      // Test restrictions on conversion

      // Types that provide no restrictions should return true for any type parameter that
      // it contains.
      T.assert(floatThing.canConvertToTypeParameter(0));
      T.assert(!floatThing.canConvertToTypeParameter(1));
      T.assert(floatThing.canConvertFromTypeParameter(0));
      T.assert(!floatThing.canConvertFromTypeParameter(1));

      // Types that provide no conversion functions should return false for all these
      // canConvert... functions.
      T.assert(!nonConvFloat.canConvertToTypeParameter(0));
      T.assert(!nonConvFloat.canConvertToTypeParameter(1));
      T.assert(!nonConvFloat.canConvertFromTypeParameter(0));
      T.assert(!nonConvFloat.canConvertFromTypeParameter(1));

      // Otherwise, types can define their own restrictions on type parameter conversion.

      let GenericPair = AT.defineGenericType({
         typename: "GenericPair",
         init: function(x, y) { 
            if (!(x instanceof this.typeParameters[0])) {
               x = new (this.typeParameters[0])(x);
            }
            this._set("x", x);
            if (!(y instanceof this.typeParameters[1])) {
               y = new (this.typeParameters[1])(y);
            }
            this._set("y", y);
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
            return new this.type(value, value.convert(this.typeParameters[1]));
         }
      });

      T.assert(GenericPair);

      let A = AT.defineType({
         typename: "A",
         init: function(x) { this._set("x", x); }
      });

      let B = AT.defineType({
         typename: "B",
         init: function(x) { this._set("x", x); }
      });
      AT.defineConversion(A, B, function(a) {
         return new B(a.x);
      });
      AT.defineConversion(B, A, function(b) {
         return new A(b.x);
      });

      let ABPair = GenericPair(AT.A, AT.B);
      let abPair = new ABPair(4.5, 7.6);

      T.assert(!abPair.canConvertToTypeParameter(0));
      T.assert(abPair.canConvertToTypeParameter(1));
      T.assert(abPair.canConvertFromTypeParameter(0));
      T.assert(!abPair.canConvertFromTypeParameter(1));

      T.assert(!AT.canConvert(ABPair, AT.A));
      T.assert(AT.canConvert(ABPair, AT.B));
      T.assert(AT.canConvert(AT.A, ABPair));
      T.assert(!AT.canConvert(AT.B, ABPair));

      T.assert(abPair.convert(AT.B).x === 7.6);
      let convertedPair = (new AT.A(4.5)).convert(ABPair);
      T.assert(convertedPair !== undefined
         && convertedPair.x.x === 4.5
         && convertedPair.y.x === 4.5);

      // Allow overriding of conversion
      AT.defineConversion(ABPair, A, function(pair) {
         return new A(75);
      });

      T.assert(abPair.convert(A).x === 75);

      AT.defineConversion(ABPair, B, function(pair) {
         return new B(56);
      });

      T.assert(abPair.convert(B).x === 56);

      AT.defineConversion(A, ABPair, function(a) {
         return new ABPair(6, 7);
      });

      let convertedPair2 = (new AT.A(4.5)).convert(ABPair);
      T.assert(convertedPair2 !== undefined
         && convertedPair2.x.x === 6
         && convertedPair2.y.x === 7);

      // Ensure these overridden conversions don't affect other instances of this generic
      // type
      let FloatIntPair = GenericPair(AT.Float, AT.Int);
      let floatIntPair = new FloatIntPair(2.3, 4);
      T.assert(floatIntPair.convert(AT.Int).value === 4);

      // TODO: should convert(To|From)TypeParameter(n) call the overridden conversion?
      // If so, should the corresponding canConvert functions call AT.canConvert?
   },

   //--------------------------------------------------------------------------------
   // A few tests for basic types
   function() {
      let f1 = new AT.Float(5.6);
      T.assert(f1 && f1.value === 5.6);
      let f2 = new AT.Float(f1);
      T.assert(f2 && f2.value === 5.6); // Ensure no nested floats

      let i1 = new AT.Int(4.2);
      T.assert(i1 && i1.value === 4);
      let i2 = new AT.Int(i1);
      T.assert(i2 && i2.value === 4); // Ensure no nested ints

      let s1 = new AT.String("hi");
      T.assert(s1 && s1.value === "hi");
      let s2 = new AT.String(s1);
      T.assert(s2 && s2.value === "hi"); // Same with strings

      let v1 = new AT.Vector(3, 4, 5);
      T.assert(v1.x() === 3 && v1.y() === 4 && v1.z() === 5);
      let v2 = new AT.Vector([4, 5, 6]);
      T.assert(v2.x() === 4 && v2.y() === 5 && v2.z() === 6);
      let v3 = new AT.Vector();
      T.assert(v3.x() === 0 && v3.y() === 0 && v3.z() === 0);
      let v4 = new AT.Vector(6);
      T.assert(v4.x() === 6 && v4.y() === 0 && v4.z() === 0);

   },

   //--------------------------------------------------------------------------------
   // Test array type
   function() {
      T.assert(typeof AT.Array === "function");
      T.assert(typeof AT.Array(AT.Float) === "function");

      let FloatArray = AT.Array(AT.Float);
      let floatArray = new FloatArray([1.2, 3.4, 5.6]);
      T.assert(floatArray.get(0).value === 1.2);
      T.assert(floatArray.get(1).value === 3.4);
      T.assert(floatArray.get(2).value === 5.6);

      T.assert(floatArray.isPrimitive());
      T.assert(T.arraysEqual(floatArray.toPrimitive(), [1.2, 3.4, 5.6]));

      let StringArray = AT.Array(AT.String);
      let stringArray = new StringArray("a", "b", 65);
      T.assert(stringArray.get(0).value === "a");
      T.assert(stringArray.get(1).value === "b");
      T.assert(stringArray.get(2).value === "65");

      let smallerArray = new FloatArray(2, 3);
      let vec2 = smallerArray.convert(AT.Vector);
      T.assert(vec2.x() === 2);
      T.assert(vec2.y() === 3);
      T.assert(vec2.z() === 0);
      T.assert(vec2.dim() === 2);
      smallerArray = vec2.convert(AT.Array(AT.Float));
      T.assert(smallerArray.get(0).value === 2);
      T.assert(smallerArray.get(1).value === 3);
      T.assert(smallerArray.length() === 2);

      let IntArray = AT.Array(AT.Int);
      T.assert(AT.canConvert(FloatArray, IntArray));
      let intArray = floatArray.convert(IntArray);
      T.assert(intArray.get(0).value === 1);
      T.assert(intArray.get(1).value === 3);
      T.assert(intArray.get(2).value === 6);
      T.assert(T.arraysEqual(intArray.toPrimitive(), [1, 3, 6]));
      let intVec3 = intArray.convert(AT.Vector);
      T.assert(intVec3.x() === 1);
      T.assert(intVec3.y() === 3);
      T.assert(intVec3.z() === 6);
   },

   //--------------------------------------------------------------------------------
   // Test function types
   function() {
      let procedureCalled = false;
      let procedure = new (AT.Function(AT.Void))(function() { 
         procedureCalled = true;
      });
      T.assert(!procedureCalled);
      procedure.call();
      T.assert(procedureCalled);

      // Disallow empty type parameters
      T.assertThrows(AT.ConstructionError, function() {
         let brokenProcedure = new (AT.Function())(function(){});
      });

      // Disallow things that are not functions
      T.assertThrows(AT.ConstructionError, function(){
         let brokenFunction = new (AT.Function(AT.Float))(3.5);
      });

      let additionFunc = function(x, y) {
         return x + y;
      }

      let floatAdder = new (AT.Function(AT.Float, AT.Float, AT.Float))(additionFunc);
      T.assert(floatAdder.call(3.1, 4.3) === 7.4);
      let intAdder = new (AT.Function(AT.Float, AT.Float, AT.Int))(additionFunc);
      T.assert(intAdder.call(3.1, 4.3) === 7);

      let stringifier = new (AT.Function(AT.Float, AT.String))(function (f) {
         return (f + 1) + " is the answer";
      });
      T.assert(stringifier.call(5) === "6 is the answer");

      // Ensure the right thing happens even if you return wrapped values
      let stringifier2 = new (AT.Function(AT.Float, AT.String))(function (f) {
         return new AT.String((f + 1) + " is the answer");
      });
      T.assert(stringifier2.call(5) === "6 is the answer");

      T.assert(stringifier.call(new AT.Float(5)) === "6 is the answer");
      T.assert(stringifier2.call(new AT.Float(5)) === "6 is the answer");

      // Arguments and return values should automatically convert
      let intMaker = new (AT.Function(AT.Int, AT.String))(function(x) {
         return x - 1;
      });
      T.assert(intMaker.call(3.2) === "2");
      T.assert(intMaker.call(3.45) === "2");
      T.assert(intMaker.call(new AT.Float(3.45)) === "2");
      T.assert(intMaker.call(new AT.String("3")) === "2");

      // Values can be converted to constant functions that return them
      T.assert(AT.canConvert(AT.Int, AT.Function(AT.Int)));
      T.assert(AT.canConvert(AT.Int, AT.Function(AT.Int, AT.Int)));
      T.assert(AT.canConvert(AT.Int, AT.Function(AT.Int, AT.Int, AT.Int)));
      T.assert(AT.canConvert(AT.String, AT.Function(AT.Float, AT.Int, AT.String)));
      let intValue = new AT.Int(3);
      let constantIntFunc = intValue.convert(AT.Function(AT.Int));
      T.assert(constantIntFunc && constantIntFunc.call() === 3);

      // Functions of fewer arguments with the same return value can be converted to functions
      // of more arguments
      T.assert(AT.canConvert(AT.Function(AT.Int), AT.Function(AT.Int, AT.Int)));
      T.assert(AT.canConvert(AT.Function(AT.Int), AT.Function(AT.Int, AT.String, AT.Int)));
      T.assert(AT.canConvert(AT.Function(AT.String), AT.Function(AT.Float, AT.Int, AT.String)));
      let intFunc = new (AT.Function(AT.Int, AT.Int))(function(x) { return x + 1; });
      let intFunc2 = intFunc.convert(AT.Function(AT.Int, AT.String, AT.Int));
      T.assert(intFunc2 && intFunc2.call(2, "potato") === 3);
      // But functions of more arguments cannot be converted to functions of fewer arguments.
      T.assert(!AT.canConvert(AT.Function(AT.Int, AT.Int, AT.Int), AT.Function(AT.Int, AT.Int)));

      // Functions can be converted to other functions where the types are compatible

      let makeBiggerFloat = new (AT.Function(AT.Float, AT.Float))(function (x) {
         return x + 0.5;
      });
      T.assert(makeBiggerFloat.call(2.1) === 2.6);
      T.assert(AT.canConvert(AT.Function(AT.Float, AT.Float), AT.Function(AT.Int, AT.Int)));
      let makeBiggerInt = makeBiggerFloat.convert(AT.Function(AT.Int, AT.Int));
      let wrappedIntResult = makeBiggerInt.callWrapped(1.7);
      T.assert(wrappedIntResult instanceof AT.Int && wrappedIntResult.value === 3);
      T.assert(makeBiggerInt.call(1.7) === 3);

      // But types are only compatible in certain directions: covariantly in the return type
      // and contravariantly in the argument types

      AT.defineType({ typename: "A", init: function(){} });
      AT.defineType({ typename: "B", init: function(){} });
      AT.defineType({ typename: "C", init: function(){} });
      AT.defineConversion(AT.A, AT.B, function(a) { return new AT.B() });

      // In other words, input types have to be converted in the opposite direction
      T.assert(AT.canConvert(AT.Function(AT.B, AT.B, AT.A), AT.Function(AT.A, AT.A, AT.B)));
      T.assert(AT.canConvert(AT.Function(AT.B, AT.B, AT.A), AT.Function(AT.A, AT.A, AT.C, AT.B)));
      T.assert(!AT.canConvert(AT.Function(AT.A, AT.A, AT.A), AT.Function(AT.B, AT.B, AT.B)));
      T.assert(!AT.canConvert(AT.Function(AT.B, AT.B, AT.B), AT.Function(AT.A, AT.A, AT.A)));
   },

   //--------------------------------------------------------------------------------
   // Test evaluatable expression type
   function() {
      let floatThing = (new AT.Expression("3.14")).convert(AT.Float);
      T.assert(floatThing.value === 3.14);

      floatThing = (new AT.Expression("3.1-2.1")).convert(AT.Float);
      T.assert(floatThing.value === 1.0);

      floatThing = (new AT.Expression("potato")).convert(AT.Float);
      T.assert(floatThing.value === 0.0);

      let intThing = (new AT.Expression("1.1+2.2")).convert(AT.Int);
      T.assert(intThing.value === 3);
   },

   //--------------------------------------------------------------------------------
   // Test pair type
   function() {
      let FloatIntPair = AT.Pair(AT.Float, AT.Int);
      let IntFloatPair = AT.Pair(AT.Int, AT.Float);

      let myPair = new FloatIntPair(4.4, 6.2);
      T.assert(myPair.first.value === 4.4);
      T.assert(myPair.second.value === 6);
      T.assert(AT.canConvert(FloatIntPair, IntFloatPair));
      let convertedPair = myPair.convert(IntFloatPair);
      T.assert(convertedPair.first.value === 4);
      T.assert(convertedPair.second.value === 6);

      T.assert(AT.canConvert(FloatIntPair, AT.Float));
      T.assert(myPair.convert(AT.Float).value === 4.4);
      T.assert(myPair.convert(AT.Int).value === 6);
   },

   //--------------------------------------------------------------------------------
   // Test "pretty printing" of type names
   function() {
      T.assert(AT.prettyTypename(AT.Float) === "Float");

      let FloatIntPair = AT.Pair(AT.Float, AT.Int);

      T.assert(AT.prettyTypename(FloatIntPair) === "Pair(Float, Int)");

      let CrazyType = AT.Pair(AT.Pair(AT.Float, AT.Pair(AT.String, AT.Int)),
         AT.Pair(AT.Function(AT.Float, AT.String, AT.Void), AT.Array(AT.Float)));

      T.assert(AT.prettyTypename(CrazyType) === "Pair(Pair(Float, Pair(String, Int)), "
         + "Pair(Function(Float, String, Void), Array(Float)))");
   },

   //--------------------------------------------------------------------------------
   // Test NxN matrix type
   function() {
      let mx1 = new AT.Matrix([[1, 2, 3], [4, 5, 6], [7, 8], [9, 10]]);

      function testMx(mx) {
         T.assert(mx.numRows() === 4);
         T.assert(mx.numColumns() === 3);
         T.assert(T.arraysEqual(mx.dimensions(), [4, 3]));
         T.assert(mx.element(0, 0) === 1);
         T.assert(mx.element(1, 2) === 6);
         T.assert(mx.values[2][2] === 0);
         T.assert(mx.element(2, 2) === 0);
         T.assert(mx.element(3, 1) === 10);
         T.assert(mx.element(3, 2) === 0);
         T.assert(mx.element(4, 2) === 0);

         let referenceValues = [[1, 2, 3], [4, 5, 6], [7, 8, 0], [9, 10, 0]];
         T.assert(T.arraysEqual(mx.values, referenceValues));
      }

      testMx(mx1);
      let mx2 = new AT.Matrix(mx1);
      testMx(mx2);

      let mx3 = new AT.Matrix(3, 4);
      T.assert(mx3.numRows() === 3);
      T.assert(mx3.numColumns() === 4);
      for (let row = 0; row < mx3.numRows(); row++) {
         for (let col = 0; col < mx3.numColumns(); col++) {
            T.assert(mx3.element(row, col) === 0);
            T.assert(mx3.values[row][col] === 0);
         }
      }

      let someValues = [[1, 2, 3],
                        [4, 5, 6],
                        [7, 8, 9],
                        [10, 11, 12]];
      let mx4 = new AT.Matrix(someValues);
      let transposedValues = [[1, 4, 7, 10], [2, 5, 8, 11], [3, 6, 9, 12]];
      T.assert(T.arraysEqual(mx4.transpose().values, transposedValues));

      let mx5 = new AT.Matrix([[1, 2, 3, 4],
                               [5, 6, 7, 8],
                               [9, 10, 11, 12],
                               [13, 14, 15, 16],
                               [17, 18, 19, 20]]);
      T.assert(mx5.canMultiply(mx4));
      let resultMx = mx5.times(mx4);
      T.assert(T.arraysEqual(resultMx.values, 
         [[ 70,  80,  90],
           [158, 184, 210],
           [246, 288, 330],
           [334, 392, 450],
           [422, 496, 570]]));

      T.assert(!mx4.canMultiply(mx5));
      T.disableConsoleErrors();
      T.assert(mx4.times(mx5) === undefined);
      T.enableConsoleErrors();

      let doubledMxValues = [[2, 4, 6],
                             [8, 10, 12],
                             [14, 16, 18],
                             [20, 22, 24]];
      T.assert(mx4.canMultiply(2));
      T.assert(mx4.canMultiply(new AT.Float(2)));
      T.assert(T.arraysEqual(mx4.times(2).values, doubledMxValues));
      T.assert(T.arraysEqual(mx4.times(new AT.Float(2)).values, doubledMxValues));

      let mx6 = new AT.Matrix(4, 3);
      for (let row = 0; row < 4; row++) {
         for (let col = 0; col < 3; col++) {
            mx6.setElement(row, col, someValues[row][col]);
         }
      }
      T.assert(T.arraysEqual(mx6.values, someValues));

      let flatValues = [1, 2, 3,
                        4, 5, 6,
                        7, 8, 9,
                        10, 11, 12];
      T.assert(T.arraysEqual(mx4.toFlatArray(), flatValues));
   }
];

