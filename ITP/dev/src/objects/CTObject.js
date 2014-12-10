define(["THREE"], function (THREE) {

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


	CT.CTObject.prototype.objectCount = function(){
		return (CT.CTObject.count);
	};

	CT.CTObject.prototype.setInValue = function(index,value){
		this.inValue[index]=value;
	};

	CT.CTObject.prototype.getOutValue = function(){
		return this.outValue;
	};

	/**
	 * Add a new port
	 * @param {object} portIndex,position,rotation,scale [description]
	 */
	CT.CTObject.prototype.addPort = function(params){

		var args = params || {};

		var portIndex = args.portIndex || this.ports.length;

		var position = args.position || CT.Utils.zeroVec();
		var rotation = args.rotation || new THREE.Euler(0,0,0);
		var scale = args.scale || CT.Utils.zeroVec();

		var port = new CT.Port();

		port.position = position;
		port.rotation = rotation;
		port.scale = scale;

		this.ports.splice(portIndex,0,port);

	};

	/**
	 * remove a port at index
	 * @param  {int} index [description]
	 */
	CT.CTObject.prototype.removePort = function(index){

		this.ports.splice(portIndex,1);

	};
	
	CT.CTObject.prototype.evalCode  = function(code, x, y, z) {

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

  	};

	return CT;

});