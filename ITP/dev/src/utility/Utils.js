define(function(){

	var CT = require('core');

	CT.Utils = {


		//JS

		extend:function(child, parent){
			function TmpConst(){}
			TmpConst.prototype = parent.prototype;
			child.prototype = new TmpConst();
			child.prototype.constructor = child;
		},

		isUndef : function(thing){
			return thing === void 0;
		},

		isDef : function(thing){
			return !(thing === void 0);
		},

		arraysEqual:function(a, b) {
			if (a === b) return true;
			if (a === null || b === null) return false;
			if (a.length != b.length) return false;
			for (var i = 0; i < a.length; ++i) {
				if (a[i] !== b[i])
					return false;
			}
			return true;
		},
		
		cloneArray : function(src) {

			var dst = [];

			for (var i = 0 ; i < src.length ; i++)
				if (src[i] instanceof Array)
					dst[i] = cloneArray(src[i]);
			else
				dst[i] = src[i];

			return dst;
		},

		arrayToString : function(a, level) {

			if (a.length == 0)
				return "[]";

			if (level === undefined)
				level = 0;

			var spacer = level == 0 ? " " : "";

			var str = "[" + spacer;

			for (var i = 0 ; i < a.length ; i++)
				str += (a[i] instanceof Array ? arrayToString(a[i], level+1) : a[i]) +
					spacer + (i < a.length-1 ? "," + spacer : "]");

			return str;
		},

		firstUndefinedArrayIndex : function(arr) {
			var n = 0;
			while (n < arr.length && isDef(arr[n]) && arr[n] !== null)
				n++;
			return n;
		},

		getIndex : function(arr, obj) {
			var i = arr.length;
			while (--i >= 0 && arr[i] !== obj) ;
				return i;
		},

		sample : function(arr, t) {
			t = max(0, min(0.999, t));
			var n = arr.length;
			if (n == 1)
				return arr[0];
			var i = floor((n-1) * t);
			var f = (n-1) * t - i;
			return lerp(f, arr[i], arr[i+1]);
		},

		newZeroArray : function(size) {
			var dst = [];
			for (var i = 0 ; i < size ; i++)
				dst.push(0);
			return dst;
		},

		findSyntaxError : function( code ) {
			var error = [];
			var save_onerror = onerror;
			onerror = function(errorMsg, url, lineNumber) {
				error = [lineNumber, errorMsg.replace("Uncaught ","")];
			};
			var element = document.createElement('script');
			element.appendChild(document.createTextNode( code ));
			document.body.appendChild(element);
			onerror = save_onerror;
			return error;
		},


		//THREE

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

		vecToString : function(v) {
			return "(" + v.x + "," + v.y + "," + v.z + ")";
		},

		//array to vec
		toVec : function(src) {
			switch (src.length) {
			default: return new THREE.Vector2(src[0],src[1]);
			case 3 : return new THREE.Vector3(src[0],src[1],src[2]);
			case 4 : return new THREE.Vector4(src[0],src[1],src[2],src[3]);
			}
		},

		//Math

		hexChar : function(n) {
			return String.fromCharCode((n < 10 ? 48 : 87) + n);
		},

		hex : function(n) {
			return this.hexChar(n >> 4) + this.hexChar(n & 15);
		},

		isNumeric : function(v) {
			return ! isNaN(v);
		},

		roundedString : function(v, nDigits) {

			var nd = nDigits === undefined ? 2 : nDigits;

			if (typeof(v) == 'string')
				v = parseFloat(v);

			var p = nd<=0 ? 1 : nd==1 ? 10 : nd==2 ? 100 : 1000;
			var str = "" + (Math.floor(p * Math.abs(v) + 0.5) / p);

			if (nDigits !== undefined && nd > 0) {

				var i = str.indexOf(".");

				if (i < 0) {
					str += ".";
					i = str.length - 1;
				}

				while (str.length - i < nd + 1)
					str += "0";

			}

			return (v < 0 ? "-" : "") + str;
		},

		lineIntersectLine : function(va, vb, vc, vd) {

			var a = [va.x,va.y];
			var b = [vb.x,vb.y];
			var c = [vc.x,vc.y];
			var d = [vd.x,vd.y];

			function L(a) { return a[0] * A[0] + a[1] * A[1]; }

			// FIRST MAKE SURE [c,d] CROSSES [a,b].

			var A = [ b[1] - a[1], a[0] - b[0] ];

			var tb = L(b);
			var tc = L(c);
			var td = L(d);

			if ((tc > tb) == (td > tb))
			return null;

			// THEN FIND THE POINT OF INTERSECTION p.

			var f = (tb - tc) / (td - tc);
			var p = [ lerp(f, c[0], d[0]), lerp(f, c[1], d[1]) ];

			// THEN MAKE SURE p LIES BETWEEN a AND b.

			A = [ b[0] - a[0], b[1] - a[1] ];

			var tp = L(p);
			var ta = L(a);
			tb = L(b);

			var vec = new THREE.Vector3(p[0],p[1],0);

			return tp >= ta && tp <= tb ? vec : null;
		},

		ik : function(len1, len2, footIn, aimIn) {

			var foot = footIn.clone();
			var aim = aimIn.clone();

			var cc = foot.dot(foot);
			var x = (1 + (len1*len1 - len2*len2)/cc) / 2;
			var y = foot.dot(aim)/cc;

			foot.multiplyScalar(y);
			aim.sub(foot);
			
			y = Math.sqrt(Math.max(0,len1*len1 - cc*x*x) / aim.dot(aim));
			return new THREE.Vector3(
				x * footIn.x + y * aim.x,
				x * footIn.y + y * aim.y,
				x * footIn.z + y * aim.z);
		},
		


	};
	
	return CT;

});
