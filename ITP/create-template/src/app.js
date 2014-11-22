define(function (require) {

    'use strict';

    // Load any app-specific modules
    // with a relative require call,
    // like:
    // 

    var CT = require('core');
    require('DLtest_01');
    require('objects/testObject');
    require('objects/testSubObject');
    require('basicMath');
    require('math/M4.js');
    require('math/math.js');

    window.CT = CT;

    return CT;

});