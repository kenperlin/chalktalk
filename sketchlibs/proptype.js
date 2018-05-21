"use strict";

// "Props" is a dummy type.
// When used in an output, it's used to denote that a sketch can control another sketch's
// internal "props" object.
// When used in an input, it's used to denote that a sketch has an internal "props" object
// that can be controlled.

AT.defineType({
   typename: "Props",
   init: function() {
   },
});

