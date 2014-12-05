define(["../../three"], function (THREE) {

	var CT = require('core');

	/**
	* Chalktalk basic object
	* @constructor
	* @return {obj} chalktalk base object
	*/
	CT.CTObject = function (params) {

		this.args = params || {};

		THREE.Object3D.call(this);

		this.strokes = [];
		this.boundingBox = {};

		this.inValue = this.args.inValue || [];
		this.outValue = null;

		this.ports = [];

		if(CT.CTObject.count === undefined){
			CT.CTObject.count = 1;
		}
		else{
			CT.CTObject.count ++;
		}

	};

	/**
	* [prototype description]
	* @type {Object}
	*/

	CT.Utils.extend(CT.CTObject,THREE.Object3D);

	CT.CTObject.prototype = {

		objectCount : function(){
			return (CT.CTObject.count);
		},

		setInValue : function(index,value){
			this.inValue[index]=value;
		},

		getOutValue : function(){
			// this.outValue = this.operation(this.inValues);
			return this.outValue;
		},

		// setOperation:function(func){

		// 	if(typeof func == 'string')
		// 		this.operation = eval('({func:function(args){\
		// 			var input1 = args.input1 || 0;\
		// 			var input2 = args.input2 || 0;\
		// 			var input3 = args.input3 || 0;\
		// 			var input4 = args.input4 || 0;\
		// 			'+func+'}})').func;
		// 	else
		// 		this.operation = func;

		// },

		// operate : function(func,params){

		// 	if(!params)
		// 		var args = {input1:0,input2:0,input3:0,input4:0};
		// 	else
		// 		var args = params;

		// 	var fun = func;

		// 	if(typeof func == 'string')
		// 		fun = eval('({func:function(args){\
		// 			var input1 = args.input1 || 0;\
		// 			var input2 = args.input2 || 0;\
		// 			var input3 = args.input3 || 0;\
		// 			var input4 = args.input4 || 0;\
		// 			'+func+'}})');

		// 	return fun.func.call(this,args);
		// },
		
		evalCode : function(code, x, y, z) {

			// IF NO ARGS ARE SUPPLIED, USE VALUES FROM THE SKETCH'S INPUT PORTS.

			function defaultToZero(arg) { return arg===undefined ? 0 : arg; }

			if (x === undefined) x = defaultToZero(this.inValue[0]);
			if (y === undefined) y = defaultToZero(this.inValue[1]);
			if (z === undefined) z = defaultToZero(this.inValue[2]);

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

      },
	};

	return CT;

});