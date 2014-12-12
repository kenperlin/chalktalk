define(["THREE"], function (THREE) {

	var CT = require('core');

	/**
	* Chalktalk Sketch Object
	* @constructor
	* @return {obj} chalktalk base object
	*/
	CT.Sketch = function (params) {

		this.args = params || {};
		CT.CTObject.call(this,params);

	};

	/**
	* [prototype description]
	* @type {Object}
	*/

	CT.Utils.extend(CT.Sketch,CT.CTObject);
	
	CT.Sketch.prototype.evalCode  = function(code, x, y, z) {

		// IF NO ARGS ARE SUPPLIED, USE VALUES FROM THE SKETCH'S INPUT PORTS.

		function defaultToZero(arg) { return arg===undefined ? 0 : arg; }

		if (x === undefined) x = defaultToZero(this.inValues[0]);
		if (y === undefined) y = defaultToZero(this.inValues[1]);
		if (z === undefined) z = defaultToZero(this.inValues[2]);

		// IF NO RETURN STATEMENT, SUPPLY ONE.

		if (code.indexOf('return') == -1)
		code = "return " + code;

		// EVAL THE CODE, REFERRING TO THE SKETCH AS "me".

		var result = null;

		try {
			result = Function("me","x","y","z", code)(this, x, y, z);
		} catch (e) { }

		// ANY ERROR RESULTS IN A RETURN VALUE OF null.

		this.outValue = result;

		return result;

  	};

	return CT;

});