// requirejs.config({
//     // "baseUrl": "../../src",
//     "paths": {
//       // "app": "./src",
//       "THREE" : "../deps/three",
//     },
//     "shim": {
//       "THREE" : {
// 			 exports : "THREE"
// 		  },
//     }
// });

// Load the main app module to start the app

define([

    'core',
    'utility/threeExtension',
    'utility/Utils',
    'objects/CTObject',
    'objects/Port',
    'objects/Sketch',
    'objects/SketchLink',
    'utility/basicMath',
    'objects/Graph',
    'UI/UI',

], function (CT) {

    'use strict';
    window.CT = CT;
    return CT;

});