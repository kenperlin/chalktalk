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

		this.inValue = this.args.inValue || null;
		this.inValues = this.args.inValues || [];
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
		return CT.CTObject.count;
	};

	CT.CTObject.prototype.setInValue = function(value,index){
		var i = index || this.inValues.length;
		this.inValues[index]=value;
	};

	CT.CTObject.prototype.getOutValue = function(){
		return this.outValue;
	};

	CT.CTObject.prototype.portsToValues = function(){
		for(var i = 0 ; i < this.ports.length ; i++){
			this.setInValue(this.ports[i].getOutValue(),i);
		}

	};

	CT.CTObject.prototype.getPort = function(index){
		if(CT.Utils.isDef(this.ports[index]))
			return this.ports[index];
		else
			return null;
	};

	CT.CTObject.prototype.getPortValue = function(index){
		if(CT.Utils.isDef(this.ports[index]))
			return this.ports[index].getOutValue();
		else
			return null;
	};

	CT.CTObject.prototype.setPortValue = function(index){
		if(CT.Utils.isDef(this.ports[index]))
			this.ports[index].setInValue();
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

	return CT;

});