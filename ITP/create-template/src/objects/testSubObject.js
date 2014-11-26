define(function () {


	var CT = require('objects/testObject');

	/**
	 *  @class a CT sub object
	 *
	 *	@constructor
	 *	@extends {CT}
	 *	@param {number=} [num=36] private variable value
	 */

	CT.subObj = function (num) {

		CT.obj.call(this);

		// private variables can go here

		var _subVar = num || 36;

		// set getters and setters here

		Object.defineProperty(this, 'sub', {
			get: function () {
				return _subVar
			},
			set: function (y) {
				if (y > 12) _subVar = y;
			}
		});

	};

	CT.subObj.prototype = Object.create(CT.obj.prototype);

	/**
	 * logs input
	 * @param  {string=} s any string
	 * @param  {array=}  arr array of strings		 * 
	 */
	CT.subObj.prototype.sayHi = function (s) {

		if(s && typeof s == 'string')
			console.log(s);
		else if(s && Object.prototype.toString.call( s ) === '[object Array]'){
			for(var i = 0 ; i < s.length ; i++){
				console.log(s[i]);
			}
		}
		else
			console.log(this);

	};

	return CT;

});