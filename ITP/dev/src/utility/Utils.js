define(function(){

	var CT = require('core');

	CT.Utils = {


		extend:function(child, parent){
			function TmpConst(){}
			TmpConst.prototype = parent.prototype;
			child.prototype = new TmpConst();
			child.prototype.constructor = child;
		},

		arraysEqual:function(a, b) {
			if (a === b) return true;
			if (a === null || b === null) return false;
			if (a.length != b.length) return false;
			for (var i = 0; i < a.length; ++i) {
			if (a[i] !== b[i]) return false;
			}
			return true;
		},

		sphere:function(s,x,y){
			var divX = x || 12;
			var divY = y || 12;
			return new THREE.Mesh(new THREE.SphereGeometry(s,x,y),new THREE.MeshLambertMaterial());
		},

		vec:function(x,y,z){
			return new THREE.Vector3(x,y,z);
		},

		zeroVec:function(){
			return new THREE.Vector3(0,0,0);
		},


		isUndef : function(thing){
			return thing === void 0;
		},

		isDef : function(thing){
			return !(thing === void 0);
		}

	};
	
	return CT;

});
