define(function(){

	var CT = require('core');

	CT.Math = {

		square:function(b){
			var a = b*b;
			return a;
		},

		multiply:function(a,b){
			return a*b;
		},

		dist:function(a,b){
			var X = Math.abs(a.x - b.x);
			var Y = Math.abs(a.y - b.y);
			return Math.sqrt((X*X)+(Y*Y));
		},

		lerp:function(a,b,t){
			return a + ((b-a)*t);
		},


	};
	
	return CT;

});
