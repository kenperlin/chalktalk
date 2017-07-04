'use strict'
 // TODO: Write tests!


var bodyParser = require("body-parser");
var express = require("express");
var formidable = require("formidable");
var fs = require("fs");
var http = require("http");
var path = require("path");

const holojam = require('holojam-node')(['relay']);

var ttDgram = require('dgram');
var ttServer = ttDgram.createSocket('udp4');
ttServer.on('listening', function () { });
ttServer.on('message', function (message, remote) { ttData.push(message); });
ttServer.bind(9090, '127.0.0.1');
let ttdata = [];


var app = express();
var port = process.argv[2] || 11235;

// serve static files from main directory
app.use(express.static("./"));


//Displaylist header reader
function readHeader(data) {
    let header = data.toString('ascii', 1, 2);
    header += data.toString('ascii', 0, 1);
    header += data.toString('ascii', 3, 4);
    header += data.toString('ascii', 2, 3);
    header += data.toString('ascii', 5, 6);
    header += data.toString('ascii', 4, 5);
    header += data.toString('ascii', 7, 8);
    header += data.toString('ascii', 6, 7);
    return header;
 }
 
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

try {
   let WebSocket = require('ws').Server;
   let wss = new WebSocket({ port: 22346 });
   let sockets = [];

   wss.on('connection', ws => {
      for (ws.index = 0; sockets[ws.index]; ws.index++);
      sockets[ws.index] = ws;

      // Communicate with first connection only
      if (ws.index == 0) {
         // Initialize
         ws.send(JSON.stringify({global: "displayListener", value: true }));

         // Broadcast curve data
         ws.on('message', data => {
            if (readHeader(data) == 'CTdata01') {
               holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
                  label: 'Display', bytes: data
               }]));
            }
         });

         /* VR Input (deprecated events) */

         holojam.on('mouseEvent', flake => {
            var type = flake.ints[0];
            type = (type == 0 ? "onmousedown"
               : (type == 1 ? "onmousemove" : "onmouseup"));

            var e = {
               eventType: type,
               event: {
                  button: 3,
                  clientX: flake.floats[0],
                  clientY: flake.floats[1]
               }
            }

            ws.send(JSON.stringify(e));
         });

         holojam.on('keyEvent', (flake) => {
            var type = flake.ints[1];
            type = (type == 0 ? "onkeydown" : "onkeyup");

            var e = {
               eventType: type,
               event: {
                  keyCode: flake.ints[0] + 48
            }};

            ws.send(JSON.stringify(e));
         });

         holojam.on('update', (flakes, scope, origin) => {
            //
         });
      }

      // Remove this sockets
      ws.on('close', () => sockets.splice(ws.index, 1));
   });
} catch (err) {
   console.log(
      '\x1b[31mCouldn\'t load websocket library. Disabling event broadcasting.'
      + ' Run \'npm install\' from Chalktalk\'s server directory\x1b[0m'
   );
}


// START THE HTTP SERVER
httpserver.listen(parseInt(port, 10), function() {
   console.log("HTTP server listening on port %d", httpserver.address().port);
});

// Debug
holojam.on('tick', (a, b) => {
  console.log('VR: [ ' + a[0] + ' in, ' + b[0] + ' out ]');
});


