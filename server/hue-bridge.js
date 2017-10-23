'use strict';

// var Hue = require('philips-hue');
var Hue = require('philips-hue');

var hue = new Hue;
var configFile = process.env.HOME+'/.philips-hue.json';

hue.bridge = "10.10.11.158";  // from hue.getBridges
hue.username = "SEkMCLj5vQP1ZP9ihJRwKSWIxllAX9jY2J7r9NB3"; // from hue.auth
hue.light(1).off()
//hue.light(1).setState({effect: "colorloop"});

// hue.getBridges()
//   .then(function(bridges){
//     console.log(bridges);
//     var bridge = bridges[0]; // use 1st bridge
//     console.log("bridge: "+bridge);
//     return hue.auth(bridge);
//   })
//   .then(function(username){
//     console.log("username: "+username);
//
//     // controll Hue lights
//     hue.light(1).on();
//     hue.light(2).off();
//     hue.light(3).setState({hue: 50000, sat: 200, bri: 90});
//   })
//   .catch(function(err){
//     console.error(err.stack || err);
//   });
