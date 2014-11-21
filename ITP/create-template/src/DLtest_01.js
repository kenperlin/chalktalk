define(function(require){

  'use strict';

	var CT = require('core');

	CT.prototype.thing = function(b){
		var a = b*b;
		document.write(a);
	};
	
	return CT;

});
