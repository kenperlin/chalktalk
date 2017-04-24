const WebSocket = require('ws');
//const holojam = require('holojam-node')(['emitter','sink'],'192.168.1.69');
const holojam = require('holojam-node')(['emitter','sink'],'192.168.1.135');
const ws = new WebSocket('ws://localhost:22346');

ws.on('open', function open() {
  ws.send(JSON.stringify({global: "displayListener", value: true }));
});

const width = 1440;
const height = 900;

holojam.on('mouseEvent',(flake) => {

  var t = flake.ints[0];
  t = (t == 0 ? "onmousedown" : (t == 1 ? "onmousemove" : "onmouseup"));

  var m = {
    eventType: t,
    event: {
      button : 3,
      clientX : (flake.floats[0]+1)/2 * width,
      clientY : height - (flake.floats[1]+1)/2 * height
    }
  }
  m = JSON.stringify(m);

  //console.log(m);
  ws.send(m);
});

holojam.on('keyEvent',(flake) => {
  var t = flake.ints[1];
  t = (t == 0 ? "onkeydown" : "onkeyup");

  var m = {
    eventType: t,
    event: {
    keyCode : flake.ints[0] + 48
  }};
  m = JSON.stringify(m);
  ws.send(m);
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
  //console.log("start with", ctdata01);
  return ctdata01;
}


/*
function readCurves(data){
  var curveObjs = {label: 'Display',vector4s:[{
            x: 0,
            y: 0,
            z: 0,
            w: 0,
         }],ints:[0]};
   // start at index:8 
   var index = 8;
   var index4buf = 0;
   var curveIntsIdx = 0;
   var vectorIdx = 0;

   var curveCnt = data.readInt16LE(index);
   index += 2;
   console.log("curveCnt", curveCnt);

   if(curveCnt < 0){
    return curveObjs;
   }

   // for each curbe
   while(index4buf < curveCnt){
      var curveSize = data.readInt16LE(index);
      curveObjs.ints[curveIntsIdx++] = (curveSize -2)/4;
      //var curveObj = {};
      index += 2;
      console.log("cur curve size:", curveSize, curveObjs.ints[curveIntsIdx-1]);

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
      
      curveObjs.vector4s[vectorIdx++] = {
        x:color.r,
        y:color.g,
        z:color.b,
        w:color.a,
      };

      for( var i = 0; i < curveSize -2; i += 4){
         // position
         var info = {
            x: data.readInt16LE(index,true) < 0 ? data.readInt16LE(index,true) + 0x10000: data.readInt16LE(index,true),
            y: data.readInt16LE(index + 2,true)< 0 ? data.readInt16LE(index + 2,true) + 0x10000: data.readInt16LE(index + 2,true),
            z: data.readInt16LE(index + 4,true)< 0 ? data.readInt16LE(index + 4,true) + 0x10000: data.readInt16LE(index + 4,true),
            w: data.readInt16LE(index + 6,true)< 0 ? data.readInt16LE(index + 6,true) + 0x10000: data.readInt16LE(index + 6,true), // width
         }
         var pos = {
            x: info.x / 0xffff * 2 - 1,
            y: info.y / 0xffff * 2 - 1,
            z: info.z / 0xffff * 2 - 1,
            w: info.w / 0xffff * 2 - 1, // width
         }
         //console.log("pos:", pos);
         curveObjs.vector4s[vectorIdx++] = pos;
         index += 8;
         index4buf += 4;
      }
   }
   //console.log("curveObjs",curveObjs);
   var sum = 0;
   for (var idx = 0; idx < curveObjs.ints.length; idx++){
      sum += curveObjs.ints[idx]+1;
   }
   if (curveObjs.vector4s.length != sum){
      console.log("wrong size", sum, curveObjs.vector4s.length);
   }
   if (curveObjs.vector4s.length < sum){
      console.log("out of index", sum, curveObjs.vector4s.length);
      for (var idx = 0; idx < curveObjs.ints.length; idx++){
        var realidx = 0;
        console.log("\t", idx, curveObjs.ints[idx], curveObjs.vector4s[realidx]);
        realidx += curveObjs.ints[idx] + 1;
     }
   }
   //holojam.Send(holojam.BuildUpdate('example', [curveObjs]));
   return curveObjs;
}

function getTime(){
  var d = new Date();
  var myDate = {
    min: d.getMinutes(),
    sec: d.getSeconds(),
    ms: d.getMilliseconds(),
  }
  return myDate;
}

function testMTU(){
  var curveObjs = {label: 'Display',vector4s:[{
            x: 0,
            y: 0,
            z: 0,
            w: 0,
         }],ints:[0]};
  for(var i = 0; i < 50; i++){
    curveObjs.vector4s[i] = {x:1,y:1,z:1,w:1};
    curveObjs.ints[i] = 1;
  }
  return curveObjs;
}
*/

ws.on('message', function incoming(data, flags) {
  // flags.binary will be set if a binary data is received.
  // flags.masked will be set if the data was masked.
  //console.log("data",data);
  // time I received displayList
  //console.log("Receive displayList", getTime());

  //let t = process.hrtime();

  var header = readHeader(data);
  if (header === "CTdata01"){
      //var curveFlakes = readCurves(data);

      var curveFlakes = {label: 'Display',bytes:data}

      //console.log("curveFlakes",curveFlakes);
      // time I parsed displayList and send
      //console.log("Parsed displayList and send", getTime());
      console.log("FlakeSize ", curveFlakes.bytes.length);
      // test maximum size of package
      //curveFlakes = testMTU();
      //console.log("curveFlakes Bytes width",curveFlakes.bytes[16] + curveFlakes.bytes[17] * 256);

      holojam.Send(holojam.BuildUpdate('ChalkTalk', [curveFlakes]));

      //console.log(process.hrtime(t)[1] / 1e6);
  }
});

/*
setInterval(() => {
	holojam.Send(
		holojam.BuildUpdate('Test',
			[
				{label: 'test',vector3s:[{x:2,y:4,z:6}]}
			]
	));
}, 20);

holojam.on('tick', (s,r) => {
	console.log(s);
});
*/
