var bodyParser = require("body-parser");
var express = require("express");
var formidable = require("formidable");
var fs = require("fs");
var http = require("http");
var path = require("path");


var ttDgram = require('dgram');
var ttServer = ttDgram.createSocket('udp4');
ttServer.on('listening', function () { });
ttServer.on('message', function (message, remote) { ttData.push(message); });
ttServer.bind(9090, '127.0.0.1');
ttData = [];


var app = express();
var port = process.argv[2] || 11235;

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

// WEBSOCKET ENDPOINT SETUP
try {
   var WebSocketServer = require("ws").Server;
   var wss = new WebSocketServer({ port: 22346 });
   var websockets = [];

   wss.on("connection", function(ws) {

      for (ws.index = 0 ; websockets[ws.index] ; ws.index++)
	 ;
      websockets[ws.index] = ws;

      ws.on("message", function(msg) {
         for (var index = 0 ; index < websockets.length ; index++)
            if (index != ws.index)
               websockets[index].send(msg);
      });

      ws.on("close", function() {
         // REMOVE THIS WEBSOCKET
         websockets.splice(ws.index, 1);
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


