define(["THREE"], function (THREE) {

	var CT = require('core');

	/**
	* Chalktalk basic object
	* @constructor
	* @return {obj} chalktalk base object
	*/
	CT.Port = function (params) {

		this.args = params || {};
		THREE.Object3D.call(this);

		this.strokes = [];
		this.boundingBox = {};

		this.inValue = null;
		this.outValue = null;

		this.update = true;

		this.evaluator = this.args.evaluator || function(o){return o;};

	};

	/**
	* [prototype description]
	* @type {Object}
	*/

	CT.Utils.extend(CT.Port,THREE.Object3D);

	/**
	 * in Value setter
	 * @param {[type]} val [description]
	 */
	CT.Port.prototype.setInValue = function(val){
		if(CT.Utils.isDef(val)){
			this.inValue = val;
		}
		this.outValue = this.evaluator(this.inValue);
	};

	CT.Port.prototype.processValue = function(f){

		var that = this;
		var func = f || this.evaluator;

		var process = null;

		//if the in value is a sketch evaluate it
		//if not pass the value

		if(this.inValue.getOutValue){
			this.inValue.evaluate();
			process = this.inValue.getOutValue();
		}
		else
			process = this.inValue;

		this.outValue = func(process);

	};

	/**
	 * out Value getter
	 * @return {[type]}     [description]
	 */
	CT.Port.prototype.getOutValue = function(){
		if(this.update)
			this.processValue();
		return this.outValue;
	};


	return CT;

});