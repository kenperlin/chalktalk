var fs = require("fs");
var http = require("http");
var path = require("path");
var url = require("url");
var port = process.argv[2] || 8888;

http.createServer(function (request, response) {
   var uri = url.parse(request.url).pathname;
   var filename = path.join(process.cwd(), uri);

   var contentTypesByExtension = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript"
   };

   fs.exists(filename, function(exists) {
      if (!exists) {
         response.writeHead(404, {"Content-Type": "text/plain"});
         response.write("404 Not Found\n");
         response.end();
         return;
      }

      if (fs.statSync(filename).isDirectory()) filename += '/index.html';

      fs.readFile(filename, "binary", function(err, file) {
         if (err) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();
            return;
         }

         var headers = {};
         var contentType = contentTypesByExtension[path.extname(filename)];
         if (contentType) headers["Content-Type"] = contentType;
         response.writeHead(200, headers);
         response.write(file, "binary");
         response.end();
      });
   });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
