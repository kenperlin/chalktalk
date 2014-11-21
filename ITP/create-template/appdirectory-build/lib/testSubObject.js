define(function () {

		// var CT = require('core');

		var CT = require('testObject');

		CT.subObj = function () {

				CT.obj.call(this);

				// private variables can go here

				var _subVar = 36;

				// set getters and setters here

				Object.defineProperty(this, 'sub', {
						get: function () {
								return _subVar
						},
						set: function (y) {
								if (y > 12) _subVar = y;
						}
				});

		};

		CT.subObj.prototype = Object.create(CT.obj.prototype);

		CT.subObj.prototype.sayHi = function (s) {

				console.log(s);

		};

		return CT;

});