define(function (require) {

    'use strict';

    // Load any app-specific modules
    // with a relative require call,
    // like:
    // 
    // var THREE = require('../deps/three');
    var CT = require('core');
    require('utility/Utils');
    // require('objects/CTObject');
    require('objects/testObject');
    // require('objects/testSubObject');
    // require('basicMath');
    console.log('hi');
    window.CT = CT;

    return CT;

});