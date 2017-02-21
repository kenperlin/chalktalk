const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:22346');

ws.on('open', function open() {
  ws.send(JSON.stringify({global: "displayListener", value: true }));
});

function readHeader(data){
   var ctdata01 = data.toString('ascii',1,2);
  ctdata01 += data.toString('ascii',0,1);
  ctdata01 += data.toString('ascii',3,4);
  ctdata01 += data.toString('ascii',2,3);
  ctdata01 += data.toString('ascii',5,6);
  ctdata01 += data.toString('ascii',4,5);
  ctdata01 += data.toString('ascii',7,8);
  ctdata01 += data.toString('ascii',6,7);
  console.log("start with", ctdata01);
  return ctdata01;
}

function readCurves(data){

   // start at index:8 
   var index = 8;
   var index4buf = 0;
   var curveCnt = data.readInt16LE(index);
   index += 2;
   console.log("curveCnt", curveCnt);

   // for each curbe
   while(index4buf < curveCnt){
      var curveSize = data.readInt16LE(index);
      index += 2;
      console.log("cur curve size:", curveSize);

      // color rgba
      var rg = data.readInt16LE(index);
      index += 2;
      var ba = data.readInt16LE(index);
      index += 2;
      index4buf += 2;
      var color = {
         r: rg >> 8,
         g: rg & 0x00ff,
         b: ba >> 8,
         a: ba & 0x00ff,
      }
      console.log("color:", color);

      for( var i = 0; i < curveSize -2; i += 4){
         // position
         var pos = {
            x: data.readInt16LE(index,true),
            y: data.readInt16LE(index + 2,true),
            z: data.readInt16LE(index + 4,true),
            w: data.readInt16LE(index + 6,true), // width
         }
         console.log("pos:", pos);
         index += 8;
         index4buf += 4;
      }
   }
}

ws.on('message', function incoming(data, flags) {
  // flags.binary will be set if a binary data is received.
  // flags.masked will be set if the data was masked.
  console.log("data",data);
  var header = readHeader(data);
  if (header === "CTdata01"){
      readCurves(data);
  }
});
