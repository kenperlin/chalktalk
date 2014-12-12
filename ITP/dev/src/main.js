define(function (require) {

    'use strict';

    // Load any app-specific modules
    // with a relative require call,
    // like:
    // 
    // var THREE = require('../deps/three');
    var CT = require('core');
    require('utility/threeExtension');
    require('utility/Utils');
    require('objects/CTObject');
    require('objects/Port');
    require('objects/Sketch');
    require('objects/testObject');
    require('UI/CTUI');
    CT.ui = new CT.UI();
    // require('objects/testSubObject');
    // require('basicMath');
    console.log('hi');
    window.CT = CT;

    // var UI = require('UI/CTUI');
    // CT.CTUI = new UI(1024,768);
    // CTUI.init();

    return CT;

});