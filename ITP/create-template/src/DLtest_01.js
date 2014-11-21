define(function(require){

  	'use strict';

	var CT = require('core');

	/**
	 * square a number
	 * @param  {number} b thing
	 * @return {number}   thing
	 */
	
	CT.prototype.thing = function(b){
		var a = b*b;
		document.write(a);
	};
	
	return CT;

});
