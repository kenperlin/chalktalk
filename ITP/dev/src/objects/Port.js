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
	};

	/**
	 * out Value getter
	 * @return {[type]}     [description]
	 */
	CT.Port.prototype.getOutValue = function(){
		return outValue;
	};


	return CT;

});