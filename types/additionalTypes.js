"use strict";

(function(AT) {
    // Chalktalk-specific type defintions go in this file.
    
    // Unknown types are meant for sketches and objects that have not been converted to use
    // Atypical types yet. They're not convertible to or from anything and are just dumb
    // wrappers around JS variables.
    AT.UnknownType = AT.defineType({
        typename: "UnknownType",
        init: function(val) {
            this._def("val", val);
        }
    })
})(Atypical);
