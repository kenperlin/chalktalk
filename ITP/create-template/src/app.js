define(function (require) {

    'use strict';

    // Load any app-specific modules
    // with a relative require call,
    // like:
    // 

    var CT = require('core');
    require('objects/testObject');
    require('objects/testSubObject');
    require('basicMath');

    window.CT = CT;

    return CT;

});