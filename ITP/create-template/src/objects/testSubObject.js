define(function () {

		// var CT = require('core');

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
		CT.subObj.prototype.sayHi = function (s,arr) {

				if(s)
					console.log(s);
				else
					console.log("I haven't the foggiest");
				if(arr){
					for(var i = 0 ; i < arr.length ; i++){
						console.log(arr[i]);
					}
				}

		};

		return CT;

});