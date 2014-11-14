define(function(){

	var CT = require('core');

	CT.obj = function(){

		//public variables go here under 'this'

		this.publicVar = Math.PI;

	};

	CT.obj.prototype = {

		constructor:CT.obj,

		//private variables go here

		_privateVar:36,

		get privateVar(){
			return this._privateVar;
		},

		set privateVar(a){
			if(a>12)
				this._privateVar = a;
			else
				console.log('too small');
		}

	};

	return CT;

});
