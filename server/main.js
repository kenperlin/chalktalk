var bodyParser = require("body-parser");
var express = require("express");
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");

var app = express();
var port = process.argv[2] || 8888;

// serve static files from main directory
app.use(express.static("./"));

// handle uploaded files
app.use(bodyParser({defer: true}));
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

      fs.writeFile(form.uploadDir + "/"
            + filename, fields.sketchContent, function(err) {
         if (err) {
            console.log(err);
         } else {
            console.log("file written");
         }
      });

      res.end();
   });
});

// handle request for list of available sketches
app.route("/ls_sketches").get(function(req, res) {
   fs.readdir("./sketches/", function(err, files) {
      if (err) {
         res.writeHead(500, { "Content-Type": "text/plain" });
         res.write(err);
         console.log("error listing the sketch directory" + err);
      } else {
         res.writeHead(200, { "Content-Type": "text/plain" });
         for (var i = 0; i < files.length; i++) {
            res.write(files[i] + "\n");
         }
      } 
      res.end();
   });
});

var server = app.listen(parseInt(port, 10), function() {
   console.log("Listening on port %d", server.address().port);
});
