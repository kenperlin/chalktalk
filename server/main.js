var bodyParser = require("body-parser");
var express = require("express");
var formidable = require("formidable");
var fs = require("fs");
var git = require("nodegit");
var path = require("path");
var readline = require("readline-sync");

//var gitUser = readline.question("github username: ");
//var gitPass = readline.question("github password for " + gitUser + ":", {noEchoBack: true});

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

// open git repo
var repository;
git.Repo.open(".git", function(err, repo) {
   if (err) throw err;
   repository = repo;
});


// handle commit requests
app.route("/commit").post(function(req, res, next) {
   var form = formidable.IncomingForm();

   form.parse(req, function(err, fields, files) {
      res.writeHead(200, {"content-type": "text/plain"});
      res.write("received commit request");

      var filename = fields.sketchName;
      var suffix = ".js";
      if (filename.indexOf(suffix, filename.length - suffix.length) == -1)
         filename += suffix; 

      // I know this is confusing but I'll fix it 
      repository.openIndex(function(err, index) {
         if (err) throw err;
         index.read(function(err) {
            if (err) throw err;   
            index.addByPath("sketches/" + filename, function(err) {
               if (err) throw err;
               index.write(function(err) {
                  if (err) throw err;
                  index.writeTree(function(err, oid) {
                     if (err) throw err;
                     git.Reference.oidForName(repository, 'HEAD', function(err, head) {
                        if (err) throw err; 
                        repository.getCommit(head, function(err, parent) {
                           if (err) throw err;
                           var author = git.Signature.now("Evan Moore", "2emoore4@gmail.com");
                           var committer = git.Signature.now("Evan Moore", "2emoore4@gmail.com");

                           repository.createCommit('HEAD', author, committer, 'new sketch from web editor', oid, [parent], function(err, commitId) {
                              console.log("New commit: " + commitId.sha());
                           });
                        });
                     });
                  });
               });
            });
         });

      });
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
