define(function (require) {

	'use strict';

	//var M4 = require('M4');

	var CT = require('core');

	CT.Math = function(){

	};

	CT.Math.prototype = {

		constructor : CT.Math,

		cross : function(a,b,c){
			if (c === undefined)
         	c = [0,0,0];
      		c[0] = a[1] * b[2] - a[2] * b[1];
      		c[1] = a[2] * b[0] - a[0] * b[2];
      		c[2] = a[0] * b[1] - a[1] * b[0];
      		return c;

		},


		just_print : function(){

			console.log("I am in Math");
		}





	};

});