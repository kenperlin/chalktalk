define(function(){

	var CT = require('core');

	CT.Math = {

		square:function(b){
			var a = b*b;
			return a;
		},

		multiply:function(a,b){
			return a*b;
		}

	};
	
	return CT;

});
