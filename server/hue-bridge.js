'use strict';

// var Hue = require('philips-hue');
var Hue = require('philips-hue');

var hue = new Hue;
var configFile = process.env.HOME+'/.philips-hue.json';
var hueState = false;

hue.bridge = "10.10.11.158";  // from hue.getBridges
hue.username = "SEkMCLj5vQP1ZP9ihJRwKSWIxllAX9jY2J7r9NB3"; // from hue.auth
hue.light(1).off()

if (hueState == false){
   hue.light(1).on()
   hueState = true;
 } else if (hueState == true){
   hue.light(1).off()
   hueState = false;
 }

var brightness = 120;
var brightnessDiff = 0;

for (var i = 0; i < 50; i++){
  brightnessDiff += 1000;
  var state = {bri: brightness, sat: 120, hue: brightnessDiff};
   hue.light(1).setState(state).then(console.log).catch(console.error);
}

 //if (hueState)

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
