define(function (require) {
    // Load any app-specific modules
    // with a relative require call,
    // like:
    // 
    var CT = require('core');

    var messages = require('./messages');

    // Load library/vendor modules using
    // full IDs, like:
    var print = require('print');
    require('DLtest_01');
    var mat = require('utility/mat');

    console.log(CT);

    // CT.thing(12);
    print(messages.getHello());
    print(CT.version());

});
