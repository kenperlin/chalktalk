'use strict'
// TODO: Write tests!

const parser = require('body-parser');
const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const dgram = require('dgram');

//These will get unicast to no matter what!
var saved_ips = ['192.168.1.14'];

// behave as a relay
const holojam = require('holojam-node')(['relay']);
// behave as a receiver and sender
//const holojam = require('holojam-node')(['emitter', 'sink'], '192.168.1.12');
holojam.ucAddresses = holojam.ucAddresses.concat(saved_ips);

const app = express();
app.use(express.static('./')); // Serve static files from main directory
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

const http = require('http');
const port = process.argv[2] || 11235;
let server = http.Server(app);

server.listen(parseInt(port, 10), () =>
   console.log('HTTP server listening on port %d', server.address().port)
);

// for sending ack back to 3dof phone to confirm the connection
var ackclient = dgram.createSocket('udp4');


// listen to android simulation through udp
const udpServer = dgram.createSocket('udp4');
var udpHOST = process.argv[3] || "192.168.1.126";

udpServer.on('error', (err) => {
  console.log(`udpServer error:\n${err.stack}`);
  udpServer.close();
});

var PORT = 11000;
//var HOST = '216.165.71.243';

udpServer.on('listening', function () {
    var address = udpServer.address();
    console.log('UDP udpServer listening on ' + address.address + ":" + address.port);
	
});

//
// Summary:
//   Began = 1,  A finger touched the screen.
//   Moved = 2,   A finger moved on the screen.
//   Stationary = 3,  A finger is touching the screen but hasn't moved.
//  Ended = 4,   A finger was lifted from the screen. This is the final phase of a touch.
//  Canceled = 5   The system cancelled tracking for the touch.
var curDaydreamInput = {
	threedof:true,
	rx:0,
	ry:0,
	rz:0,
	state:0,
	x:0,
	y:0
};

udpServer.on('message', function (message, remote) {
    //console.log(remote.address + ':' + remote.port +' - ' + message + message.length);
	
	if(new String(message).contains("Is anybody there?"))
		ackclient.send(message, 0, message.length, remote.port, remote.address, function(err, bytes) {
			//console.log('UDP message sent to ' + remote.address +':'+ remote.port);
			if (err) 
				ackclient.close();
		});
	
	if(message.length != 24)
		return;
	var index = 0;
    curDaydreamInput.rx = message.readFloatLE(index);
	index += 4;
	curDaydreamInput.ry = message.readFloatLE(index);
	index += 4;
	curDaydreamInput.rz = message.readFloatLE(index);
	index += 4;
	curDaydreamInput.state = message.readInt32LE(index);
	index += 4;
	curDaydreamInput.x = message.readFloatLE(index);
	index += 4;
	curDaydreamInput.y = message.readFloatLE(index);
	
	//console.log(rx,ry,rz,state,x,y);
	//console.log(curDaydreamInput);
});

udpServer.bind(PORT, udpHOST);
// end of udp server

let data = [], time = 0;

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

// zhenyi: send 3dof cursor
setInterval( function() { sendDaydreamInput(); }, 20);
var curWS;
function sendDaydreamInput(){
	if(curWS != null){
		curWS.send(JSON.stringify(curDaydreamInput));
	}
}

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
		   curWS = ws;
         // Broadcast curve data
         ws.on('message', data => {
            if (readHeader(data) == 'CTdata01') {
               /*
               //console.log("{");
               //console.log(new Uint16Array(data, 0, 2)[0]);
               //console.log(data.subarray(0, 20));
               //console.log(data.subarray(0, 10));

               //console.log("DATA LENGTH: " + data.length + " DATA BYTE LENGTH: " + data.byteLength);

               //var A = new Uint16Array(data, 0, data.byteLength / 2);
               //var B = new Uint16Array(data, data.byteLength / 2);


               //console.log("A LENGTH: " + A.length + " A BYTE LENGTH: " + A.byteLength);
               //console.log("B LENGTH: " + B.length + " B BYTE LENGTH: " + B.byteLength);

               var buffA = data.subarray(0, data.byteLength / 2);
               var buffB = data.subarray(data.byteLength / 2);
               for (let i = 0; i < 8; ++i) {
                  buffB[i] = buffA[i];
               }

               //console.log(buffA);
               //console.log(buffB);

               //console.log(readHeader(buffA) == "CTdata01" && readHeader(buffB) == "CTdata01");

               //console.log("}");

               */



               /* OLD
               ///*
               const HEADER_SIZE = 8;
               var A = new Uint8Array(((data.byteLength - HEADER_SIZE) / 2) + HEADER_SIZE);
               var B = new Uint8Array(((data.byteLength - HEADER_SIZE) / 2) + HEADER_SIZE);  
               const buffA = Buffer.from(A.buffer);
               const buffB = Buffer.from(B.buffer);

               data.copy(buffA, 0, 0, HEADER_SIZE);
               data.copy(buffB, 0, 0, HEADER_SIZE);

               //console.log(data);
               //console.log(buffA);
               //console.log(buffB);

               //console.log(data.length); 
               //console.log(buffA.length);
               //console.log(buffB.length);

               const ALL = new Uint8Array(60008 * 4);

               const T1 = Buffer.from(ALL.buffer, 0,         60008);
               const T2 = Buffer.from(ALL.buffer, 60008,     60008);
               const T3 = Buffer.from(ALL.buffer, 60008 * 2, 60008);
               const T4 = Buffer.from(ALL.buffer, 60008 * 3, 60008);

               data.copy(T1, 0, 0, HEADER_SIZE);
               data.copy(T2, 0, 0, HEADER_SIZE);
               data.copy(T3, 0, 0, HEADER_SIZE);
               data.copy(T4, 0, 0, HEADER_SIZE);


               
               
               


               holojam.Send(holojam.BuildUpdate('ChalkTalk', [
                  {
                     label: 'Display1', bytes: T1, ints : new Uint16Array([4, 1])
                  }
               ]));

               holojam.Send(holojam.BuildUpdate('ChalkTalk', [
                  {
                     label: 'Display2', bytes: T2, ints : new Uint16Array([4, 2])
                  } 
               ]));

               holojam.Send(holojam.BuildUpdate('ChalkTalk', [
                  {
                     label: 'Display3', bytes: T3, ints : new Uint16Array([4, 3])
                  } 
               ]));

               holojam.Send(holojam.BuildUpdate('ChalkTalk', [
                  {
                     label: 'Display4', bytes: T4, ints : new Uint16Array([4, 4])
                  }
               ]));
               */

               // TRY HERE

/*
               const len = data.byteLength;
               let sliceCount = 1;

               console.log("LEN: " + len);

               while (len > (60000 * sliceCount)) {
                  sliceCount *= 2;
               }

               const labelPrefix = "Display";

               console.log("slice count: " + sliceCount);

               if (sliceCount == 1) {
                  holojam.Send(holojam.BuildUpdate('ChalkTalk', [
                     {
                        label: 'Display1', bytes: data, ints: [1, 1]
                     }
                  ]));                
               }
               else {
                  const HEADER_SIZE = 8;
                  var A = new Uint8Array(((data.byteLength - HEADER_SIZE) / sliceCount) + HEADER_SIZE);
                  var B = new Uint8Array(((data.byteLength - HEADER_SIZE) / sliceCount) + HEADER_SIZE);
                  const buffA = Buffer.from(A.buffer);
                  const buffB = Buffer.from(B.buffer);

                  data.copy(buffA, 0, 0, HEADER_SIZE);
                  data.copy(buffB, 0, 0, HEADER_SIZE);

                  console.log("ALEN: " + A.length);
                  console.log("BLEN: " + B.length);

                  //console.log(buffA.byteLength);
                  //console.log(buffB.byteLength);

                  holojam.Send(holojam.BuildUpdate('ChalkTalk', [
                     {
                        label: 'Display1', bytes: buffA, ints: [2, 1]
                     },
                     {
                        label: 'Display2', bytes: buffB, ints: [2, 2]
                     } 
                  ]));

               }
*/
               //

               const len = data.byteLength;
               let countSlices = 1;
               //console.log("INITIAL LENGTH: " + len);
               while (len > 100 * countSlices) {
                  countSlices *= 2;
               }

               //console.log("DATA BYTE LENGTH: " + data.byteLength);
               //console.log("DATA SLICES: " + countSlices);

               const labelPrefix = "Display";

               if (countSlices == 1) {
                  holojam.Send(holojam.BuildUpdate('ChalkTalk', [
                     {
                        label: labelPrefix + "1", bytes: data, ints: [1, 1]
                     },
                  ]));       
               }
               else {
                  const sliceList = [];
                  const HEADER_SIZE = 8;
                  const bytesPerSlice = Math.ceil(((data.byteLength - HEADER_SIZE) / countSlices));

                  console.log("data size: " + data.byteLength);

                  // console.log("{");
                  // var D = "{";
                  // for (var i = 0; i < data.byteLength; i++) {
                  //    D += data[i] + ", ";
                  // }
                  // D += "}";
                  // console.log(D);

                  //console.log("bytesPerSlice - header_size: " + bytesPerSlice);

                  { 
                     var doCorrection = false;
                     var i = 0;
                     for (var byteOffset = HEADER_SIZE;
                             i < countSlices; 
                             ++i, byteOffset += bytesPerSlice
                     ) {

                        if (byteOffset >= data.byteLength) {
                           doCorrection = true;
                           break;
                        }

                        //console.log("byte_offset: " + byteOffset);

                        const buffSize = HEADER_SIZE + Math.min(
                           bytesPerSlice,
                           (data.byteLength) - byteOffset
                        );

                        //console.log("creating slice " + (i + 1) + " of size " + buffSize);
                        
                        var u8arr = new Uint8Array(buffSize);
                        var u8buff = Buffer.from(u8arr.buffer);


                        data.copy(u8buff, 0, 0, HEADER_SIZE);
                        const sourceEnd = Math.min(byteOffset + bytesPerSlice, data.byteLength);
                        //console.log("copying data section: target_start=" + HEADER_SIZE + " source_start=" + byteOffset + " source_end=" + sourceEnd);
                        data.copy(u8buff, HEADER_SIZE, byteOffset, sourceEnd);

                        sliceList.push([{ 
                           label : labelPrefix + (i + 1), 
                           bytes : u8buff, 
                           ints  : new Uint16Array([countSlices, i + 1])
                        }]);
                     }

                     // CORRECT OFF-BY-1 SLICE COUNT
                     if (doCorrection) {
                        //console.log("CORRECTING SLICE COUNT")
                        countSlices = i;
                        for (i = 0; i < countSlices; ++i) {
                           try {
                              sliceList[i][0].ints[0] = countSlices;
                           } catch (e) {
                              console.error("index" + i);
                              console.error(sliceList[i]);
                              throw e;
                           }
                        }
                     }

                  }

                  console.log("SLICE COUNT: " + countSlices);
                  // for (var i = 0; i < sliceList.length; ++i) {
                  //    console.log(sliceList[i][0].bytes.byteLength);
                  //    var S = "{";
                  //    for (let j = 0; j < sliceList[i][0].bytes.byteLength; ++j) {
                  //       S += sliceList[i][0].bytes[j] + ", ";
                  //    }
                  //    S += "}";
                  //    console.log(S);
                  // }
                  // console.log("}");

                  // TESTING
                  const dataLen = data.byteLength;
                  var byteIdx = HEADER_SIZE;
                  for (var sliceIdx = 0; 
                           byteIdx < dataLen && sliceIdx < countSlices; 
                           ++sliceIdx)
                  {
                     const slice = sliceList[sliceIdx][0].bytes;
                     const sliceLen = slice.byteLength;
                     for (var j = HEADER_SIZE; j < sliceLen; ++j) {
                        console.assert(data[byteIdx] == slice[j]);
                        ++byteIdx;
                     }
                  }
                  console.assert(byteIdx == dataLen);


                  for (var i = 0; i < countSlices; ++i) {
                     holojam.Send(holojam.BuildUpdate('ChalkTalk', sliceList[i]));
                  }
               }
               
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
			for (var i=0; i < flakes.length; i++) {
				var flake = flakes[i];
				if(flake.label.contains("Stylus")){
					console.log(flake.vector3s[0].z);
					var type = flake.ints[0];
					type = (type == 0 ? "onmousedown"
					: (type == 1 ? "onmousemove" : "onmouseup"));

					var e = {
					   eventType: type,
					   event: {
						  button: 3,
						  clientX: flake.vector3s[0].z * 1920,
						  clientY: flake.vector3s[0].y * 1080
					   }
					};

					ws.send(JSON.stringify(e));					
				}
				
			}
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

String.prototype.endsWith = function(suffix) {
   return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.contains = function(substr) {
   return this.indexOf(substr) > -1;
};

function returnString(res, str) {
   res.writeHead(200, { 'Content-Type': 'text/plain' });
   res.write(str + '\n');
   res.end();
};

function readDir(res, dirName, extension) {
   fs.readdir('./' + dirName + '/', (err, files) => {
      if (err) {
         res.writeHead(500, { 'Content-Type': 'text/plain' });
         res.write(err);
         res.end();

         console.log('Error listing the ' + dirName + ' directory' + err);
         return;
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      for (let i = 0; i < files.length; ++i) {
         if (!extension || files[i].toLowerCase().endsWith(extension.toLowerCase())) {
            res.write(files[i] + '\n');
         }
      }
      res.end();
   });
}

/* Handle uploaded files */

app.route('/upload').post((req, res, next) => {
   let form = formidable.IncomingForm();
   form.uploadDir = './sketches';
   form.keepExtensions = true;

   form.parse(req, (err, fields, files) => {
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.write('received upload:\n\n');

      let filename = fields.sketchName;
      let suffix = '.js';

      if (filename.indexOf(suffix, filename.length - suffix.length) == -1)
         filename += suffix;

      fs.writeFile(form.uploadDir + '/' + filename, fields.sketchContent, err => {
         if (err) console.log(err);
         else console.log('File written');
      });

      res.end();
   });
});

app.route('/getTT').post((req, res, next) => {
   let form = formidable.IncomingForm();

   form.parse(req, (err, fields, files) => {
      if (data.length > 0) {
         returnString(res, data[0]);
         data = [];
      }
   });
});

app.route('/set').post((req, res, next) => {
   let form = formidable.IncomingForm();

   form.parse(req, (err, fields, files) => {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');

      let key = fields.key;
      let suffix = '.json';

      if (key.indexOf(suffix, key.length - suffix.length) == -1)
         key += suffix;

      fs.writeFile(key, fields.value, err => {
         if (err) console.log(err);
         else console.log('File written');
      });

      res.end();
   });
});

app.route('/writeFile').post((req, res, next) => {
   let form = formidable.IncomingForm();

   form.parse(req, (err, fields, files) => {
      fs.writeFile(fields.fileName, JSON.parse(fields.contents),
         err => { if (err) console.log(err) }
      );
      res.end();
   });
});

app.route('/talk').get((req, res) => res.sendfile('index.html'));
app.route('/listen').get((req, res) => res.sendfile('index.html'));

// Handle request for the current time
app.route('/getTime').get((req, res) => {
   time = (new Date()).getTime();
   returnString(res, '' + time);
});

// Handle request for list of available sketches
app.route('/ls_sketches').get((req, res) => readDir(res, 'sketches', '.js'));

// Handle request for list of available sketch libraries
app.route('/ls_sketchlibs').get((req, res) => readDir(res, 'sketchlibs', '.js'));

// Handle request for list of available images
app.route('/ls_images').get((req, res) => readDir(res, 'images'));

// handle request for list of state files
app.route('/ls_state').get((req, res) => readDir(res, 'state'));

// Debug
holojam.on('tick', (a, b) => {
  console.log('VR: [ ' + a[0] + ' in, ' + b[0] + ' out ]');
});
