"use strict";

function _sendStrokeToDisplayListener(w, h, rgba, isFill, buffer) {

  _sendObjectHeaderToDisplayListener(w, h, 12 + buffer.length, rgba);

  displayList.push(isFill ? 1 : 0);        // Type: 0 == stroke, 1 == fill

  for (i = 0 ; i < buffer.length ; i++) {
	 let n = _convertToFloatByte(buffer[i]);
	 displayList.push(n[0]);
	 displayList.push(n[1]);
  }
}



function  _sendObjectHeaderToDisplayListener(w, h, size, rgba, x, y, s) {
  displayList[0] += size;
  displayList.push(size);                  // Total no. of 2-byte words, including this one.
 //console.log("SIZE IN 16 bit ints: " + size);
 //console.log("displayListObjectId: " + displayListObjectId);
 // use sketchPage id
 displayList.push(pageIndex);
 //console.log("sketchPage.page:" + sketchPage.index);
  //displayList.push(displayListObjectId++); // Unique id for this display object.


  //labelPrint("COLOR BEFORE in _sendObject", rgba);
  rgba[0] = clamp(rgba[0], 0, 1);
  rgba[1] = clamp(rgba[1], 0, 1);
  rgba[2] = clamp(rgba[2], 0, 1);
  rgba[3] = clamp(rgba[3], 0, 1);
  //labelPrint("COLOR AFTER in _sendObject", rgba);

  displayList.push( floor(255*rgba[0]) << 8 | floor(255*rgba[1]) ); // Color: red, green
  displayList.push( floor(255*rgba[2]) << 8 | floor(255*rgba[3]) ); //        blue, alpha

  if (s) {
	 // zhenyi for text, actually I think it is in windows coordinate system
	 x = ((x / w) * 2) - 1;
	 y = (h/w - (y / w * 2));  // x and y should be in [-1,1] range with respect to window.width() scale
	 //console.log("[" + x + ", " + y + "]");
	 displayList.push(_convertToFloatByte(x)[0]);
	 displayList.push(_convertToFloatByte(x)[1]);
	 displayList.push(_convertToFloatByte(y)[0]);
	 displayList.push(_convertToFloatByte(y)[1]);
	 displayList.push(_convertToFloatByte(0));
	 displayList.push(_convertToFloatByte(0));
	 DSDebug.header = "header:\t" + x + " " + _convertToFloatByte(x);
	 for (let q = 0 ; q < 3*2 ; q++)
		displayList.push(0);
	 displayList.push(_convertToFloatByte(s)[0]);
	 displayList.push(_convertToFloatByte(s)[1]);
  }

  else {
	 for (let pq = 0 ; pq < 6*2 ; pq++)      // Px,Py,Pz,Qx,Qy,Qz (identity for now)
		displayList.push(0);
	displayList.push(0);
	 displayList.push(0x1000);             // Scale: fixed precision, 2^12 === 1.0
  }
}

 function _sendTextToDisplayListener(w, h, rgba, x, y, s, text) {
  //DSDebug.xyz = "_sendTextToDisplayListener\t" + x + " "+ y + " " + s;
 // zhenyi: use factor 1000
  _sendObjectHeaderToDisplayListener(w, h, 12 + Math.ceil(text.length / 2), rgba, x, y, s / 1000.0);

  displayList.push(2);                     // Type: 2 == text

 //var S = "";
 //S += "{\n";
 //S += "TEXT: " + text + "\n";
  for (i = 0 ; i < text.length ; i += 2) {
	//S += "bytes " + i + ", " + (i + 1) + "\n"; 
	 let ch0 = text.charCodeAt(i);                            // Two characters per 2-byte word.
   //S += "\tADDING CHAR[" + ch0 + "]\n"; 
	 let ch1 = i+1 == text.length ? 0 : text.charCodeAt(i+1); // Pad with 0 if necessary.
   //S += "\tADDING CHAR[" + ch1 + "]\n"; 
	 displayList.push(ch0 << 8 | ch1);
   //S += "\tPACKED 2-BYTES: " + (ch0 << 8 | ch1) + "\n";
  }
 //S += "DISPLAY LIST LENGTH: " + displayList.length + "\n";
 //S += "}\n";
 
 //DSDebug.chars = S;
}

function  _convertToFloatByte(value) {
   // zhenyi
//var Buffer = require('buffer/').Buffer;

   //var buf = Buffer.allocUnsafe(4);
   //buf.writeFloatLE(value,0);
   //console.log("value: " + value + " byte array: " + buf);
   //return buf;
   var farr = new Float32Array(1);
   farr[0] = value;
   var ret = new Uint16Array(farr.buffer);
   
   //console.log("fvalue:" + ret);
   return ret;
  //var t = .5 + .5 * value;
  //t = max(0, min(1, t));
  //return floor(0xffff * t);
}
