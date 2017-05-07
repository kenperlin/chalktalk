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

      floatThing = (new AT.Expression("3.1-2.1")).convert(AT.Float);
      T.assert(floatThing.value === 1.0);

      floatThing = (new AT.Expression("potato")).convert(AT.Float);
      T.assert(floatThing.value === 0.0);

      let intThing = (new AT.Expression("1.1+2.2")).convert(AT.Int);
      T.assert(intThing.value === 3);

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
   }
];

