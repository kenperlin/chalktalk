define(function (require) {

	var CT = require('core');

	/**
	* Chalktalk basic object
	* @constructor
	* @return {obj} chalktalk base object
	*/
	CT.obj = function () {

		/**public variables go here under 'this'*/
		this.publicVar = Math.PI;

	};

	/**
	* [prototype description]
	* @type {Object}
	*/
	CT.obj.prototype = {

		//I don't think this is required, not sure
		// constructor: CT.obj, 

		/** a test private variable*/
		_privateVar: 36,

		/**returns the private variable*/
		get privateVar() {
			return this._privateVar;
		},

		/**
		* sets a private variable to a number
		* @type {number} a set a number
		*/
		set privateVar(a) {
			if (typeof a == "number")
				this._privateVar = a;
			else
				console.log('NaN');
		}

	};

	return CT;

});