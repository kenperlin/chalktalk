define(function (require) {

    // Load any app-specific modules
    // with a relative require call,
    // like:
    // 
    var CT = require('core');
    require('DLtest_01');
    require('testObject');
    require('testSubObject');
    require('basicMath');

    window.CT = CT;


    return CT;

});
