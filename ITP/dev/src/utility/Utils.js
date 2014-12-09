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

		sphere:function(s){
			return new THREE.Mesh(new THREE.SphereGeometry(s),new THREE.MeshLambertMaterial());
		}

	};
	
	return CT;

});
