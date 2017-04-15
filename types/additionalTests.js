"use strict";

// Add any new test functions to this array.
// Each should be a function that takes in no arguments.
// Each function gets a "clean" version of the Atypical type system, with only basic types
// defined, via the AT variable. This variable gets reset after every test.
window.AdditionalTests = [
   //--------------------------------------------------------------------------------
   // Test evaluatable expression type
   function() {
      let floatThing = (new AT.Expression("3.14")).convert(AT.Float);
      T.assert(floatThing.value === 3.14);
      T.assert(floatThing.convert(AT.Expression).str === "3.14");

      floatThing = (new AT.Expression("3.1-2.1")).convert(AT.Float);
      T.assert(floatThing.value === 1.0);
      T.assert(floatThing.convert(AT.Expression).str === "1");

      floatThing = (new AT.Expression("potato")).convert(AT.Float);
      T.assert(floatThing.value === 0.0);
      T.assert(floatThing.convert(AT.Expression).str === "0");

      let intThing = (new AT.Expression("1.1+2.2")).convert(AT.Int);
      T.assert(intThing.value === 3);
      T.assert(intThing.convert(AT.Expression).str === "3");

      let stringThing = (new AT.Expression("\"evaluate\" + \"me\"").convert(AT.String));
      T.assert(stringThing.value === "evaluateme");
      stringThing = (new AT.Expression("dontevaluateme").convert(AT.String));
      T.assert(stringThing.value === "dontevaluateme");
      // If the expression returns undefined, convert that to an empty string
      stringThing = (new AT.Expression("").convert(AT.String));
      T.assert(stringThing.value === "");
      // When strings are converted to expressions, they're escaped and surrounded with quotes
      stringThing = new AT.String("\'single\' and \"double\" quotes and \\backslashes");
      let stringExpression = stringThing.convert(AT.Expression);
      T.assert(stringExpression.str ===
         "\"\\\'single\\\' and \\\"double\\\" quotes and \\\\backslashes\"");


      let boolThing = (new AT.Expression("1 != 2 && 4 < 5")).convert(AT.Bool);
      T.assert(boolThing.value === true);
      boolThing = (new AT.Expression("syntax errors {}!!!")).convert(AT.Bool);
      T.assert(boolThing.value === false);
      T.assert(boolThing.convert(AT.Expression).str === "false");
   }
];

