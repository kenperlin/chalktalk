
var bodyParser = require("body-parser");
var express = require("express");
var formidable = require("formidable");
var fs = require("fs");
var http = require("http");
var path = require("path");
var parseArgs = require('minimist');
var unityWrapper = require('./unityWrapper.js');
var androidSim = require('./androidSim.js');
var viveWrapper = require('./viveWrapper.js');


var ttDgram = require('dgram');
var ttServer = ttDgram.createSocket('udp4');
ttServer.on('listening', function () { });
ttServer.on('message', function (message, remote) { ttData.push(message); });
ttServer.bind(9090, '127.0.0.1');
ttData = [];

unityWrapper.processArgs(process.argv.slice(2));

var app = express();
var port = parseArgs(process.argv.slice(2)).port || 11235;

// different platform support
var usingVive = false;
var using3DOF = false;

androidSim.start(using3DOF);
viveWrapper.start(usingVive);

// serve static files from main directory
app.use(express.static("./"));

// handle uploaded files
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.route("/upload").post(function(req, res, next) {
   var form = formidable.IncomingForm();
   form.uploadDir = "./sketches";
   form.keepExtensions = true;

   form.parse(req, function(err, fields, files) {
      res.writeHead(200, {"content-type": "text/plain"});
      res.write('received upload:\n\n');

      var filename = fields.sketchName;
      var suffix = ".js";
      if (filename.indexOf(suffix, filename.length - suffix.length) == -1)
         filename += suffix;

      fs.writeFile(form.uploadDir + "/" + filename, fields.sketchContent, function(err) {
         if (err) {
            console.log(err);
         } else {
            console.log("file written");
         }
      });

      res.end();
   });
});

app.route("/getTT").post(function(req, res, next) {
   var form = formidable.IncomingForm();
   form.parse(req, function(err, fields, files) {
      if (ttData.length > 0) {
         returnString(res, ttData[0]);
         ttData = [];
      }
   });
});

app.route("/set").post(function(req, res, next) {
   var form = formidable.IncomingForm();
   form.parse(req, function(err, fields, files) {
      res.writeHead(200, {"content-type": "text/plain"});
      res.write('received upload:\n\n');

      var key = fields.key;

      var suffix = ".json";
      if (key.indexOf(suffix, key.length - suffix.length) == -1)
         key += suffix;

      fs.writeFile(key, fields.value, function(err) {
         if (err) {
            console.log(err);
         } else {
            console.log("file written");
         }
      });

      res.end();
   });
});

app.route("/writeFile").post(function(req, res, next) {
   var form = formidable.IncomingForm();
   form.parse(req, function(err, fields, files) {
      fs.writeFile(fields.fileName, JSON.parse(fields.contents),
         function(err) { if (err) console.log(err); }
      );
      res.end();
   });
});

app.route("/talk").get(function(req, res) {
   res.sendfile("index.html");
});

app.route("/listen").get(function(req, res) {
   res.sendfile("index.html");
});

var time = 0;

// handle request for the current time
app.route("/getTime").get(function(req, res) {
   time = (new Date()).getTime();
   returnString(res, '' + time);
});

// handle request for list of available sketches
app.route("/ls_sketches").get(function(req, res) {
   readDir(res, "sketches", ".js");
});

// handle request for list of available sketch libraries
app.route("/ls_sketchlibs").get(function(req, res) {
   readDir(res, "sketchlibs", ".js");
});

// handle request for list of available images
app.route("/ls_images").get(function(req, res) {
   readDir(res, "images");
});

// handle request for list of state files
app.route("/ls_state").get(function(req, res) {
   readDir(res, "state");
});

function returnString(res, str) {
   res.writeHead(200, { "Content-Type": "text/plain" });
   res.write(str + "\n");
   res.end();
};

function readDir(res, dirName, extension) {
   fs.readdir("./" + dirName + "/", function(err, files) {
      if (err) {
         if (err.code === "ENOENT") {
            // Directory not found, return empty string
            res.writeHead(200, { "Content-Type": "text/plain" });
         }
         else {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.write(err.message);
            console.log("error listing the " + dirName + " directory" + err);
         }
         res.end();
         return;
      }

      res.writeHead(200, { "Content-Type": "text/plain" });
      for (var i = 0; i < files.length; i++) {
         if (!extension || files[i].toLowerCase().endsWith(extension.toLowerCase())) {
            res.write(files[i] + "\n");
         }
      }
      res.end();
   });
}

String.prototype.endsWith = function(suffix) {
   return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.contains = function(substr) {
   return this.indexOf(substr) > -1;
};

// CREATE THE HTTP SERVER
var httpserver = http.Server(app);
var wsIndex = 0;

// WEBSOCKET ENDPOINT SETUP
try {
   var WebSocketServer = require("ws").Server;
   var wss = new WebSocketServer({ port: 22346 });
   var websocketMap = new Map();

	// for unity, we only need to send data to unity for one websocket connection
   var unityIndex = 0;

   let hostIsAssigned = false;

   const wsMap = new Map();
	
   wss.on("connection", function(ws) {
	  ws.index = wsIndex++;


	  websocketMap.set(ws.index, ws);
	  if(unityIndex == -1) {
		  unityIndex = ws.index;
     }

     ws.isHost = !hostIsAssigned;
     hostIsAssigned = true;

      console.log("connection: ", ws.index);

      // Initialize
      ws.send(JSON.stringify({ global: "displayListener", value: true }));



      ws.on("message", data => {
		 //   for (var [key, value] of websocketMap) {
			//   if(key != ws.index && value.readyState == 1) {
			//      value.send(data);  
   //         }
			// }
			unityWrapper.processChalktalk(data, ws.uid);
	   });
	 
      const _newBrowserID = unityWrapper.getAndIncrementStylusID();
      console.log("setting browser ID to: " + _newBrowserID + " isHost=[" + ws.isHost + "]");
      var eForBrowser = {
         eventType: "browserSetID",
         event: { uid : _newBrowserID, isHost : ws.isHost }
      };
      ws.uid = _newBrowserID;
      wsMap.set(ws.uid, ws);

      for (var [key, value] of wsMap) {
         console.log("ws-uid=[" + key + "]");
      }

      ws.send(JSON.stringify(eForBrowser));

      for (var [key, value] of websocketMap) {
         for (var [keyother, valother] of websocketMap) {
           if(value.readyState == 1) {
              value.send(JSON.stringify({
               eventType : "clientAddUserID", 
               event : { uid : valother.uid}
              }));  
         }
        }
      }

      unityWrapper.processUnity(ws, wsMap);

      ws.on("close", function() {
         // REMOVE THIS WEBSOCKET
       console.log("closing ws index: " + ws.index);
		 websocketMap.delete(ws.index);
       wsMap.delete(ws.uid);
		 
		 if(unityIndex == ws.index){
			 if(Array.from(websocketMap.keys() ).length == 0) {
				 unityIndex = -1;
             console.log("unityIndex is now: " + unityIndex);
			 } else {
				 unityIndex = Math.min.apply( Math, Array.from(websocketMap.keys() ));
          }
       }
        for (var [key, value] of websocketMap) {
           if(key != unityIndex && value.readyState == 1) {
              value.send(JSON.stringify({
               eventType : "clientRemoveUserID", 
               event : { uid : ws.uid }
              }));  
           }
         }
		 console.log("close: websocketMap.keys():", Array.from(websocketMap.keys() ), unityIndex);

         if (ws.isHost) {
            hostIsAssigned = false;
         }
      });
   });
} catch (err) {
   console.log("\x1b[31mCouldn't load websocket library. Disabling event broadcasting."
         + " Please run 'npm install' from Chalktalk's server directory\x1b[0m");
}

// START THE HTTP SERVER
httpserver.listen(parseInt(port, 10), function() {
   console.log("HTTP server listening on port %d", httpserver.address().port);
});

/*
// Debug
holojam.on('tick', (a, b) => {
  console.log('VR: [ ' + a[0] + ' in, ' + b[0] + ' out ]');
});
*/

