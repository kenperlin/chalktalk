   "use strict";
let glyphChartDrawDisabled = true;

function _sendCTData(){
	var data = new Uint16Array(4 + displayList.length), header = 'CTdata01', i;
	for (i = 0 ; i < 4 ; i++)
		data[i] = header.charCodeAt(i<<1) << 8 | header.charCodeAt(i<<1 | 1);
	for (i = 0 ; i < data.length ; i++)
		data[i + 4] = displayList[i];

	server.socket.send(data.buffer);

	const sketch = Sketch.currentSketchMouseOver;
	let cursorZOffsetCurr = ((sketch && sketch.isMouseOver) ? sketch.zOffset() : 0);
	if (cursorZOffsetCurr != cursorZOffset.prev) {
		cursorZOffset.prev = cursorZOffsetCurr;
		console.log("SENDING CURSOR Z OFFSET: " + cursorZOffsetCurr);
		sendTimeAndFPNum('CTzOff01', cursorZOffsetCurr);
	}
	
	// mesh data info
   if (CT.modelInfo.deletionMap.size > 0) {
      displayListMesh.push(2);
      displayListMesh.push(CT.modelInfo.deletionMap.size);
      const deletionMapEntries = CT.modelInfo.deletionMap.keys();
      for (let modelToDelete of deletionMapEntries) {
         displayListMesh.push(modelToDelete);
      }
   }

   const meshData = new Uint16Array(4 + displayListMesh.length);
   const meshHeader = 'CTmesh01';
   i = 0;
   for (i = 0 ; i < 4 ; i++)
	  meshData[i] = meshHeader.charCodeAt(i<<1) << 8 | meshHeader.charCodeAt(i<<1 | 1);
   for (i = 0 ; i < meshData.length ; i++)
	  meshData[i + 4] = displayListMesh[i];

   //console.log("sending mesh from client");
   //console.log(meshData)
   server.socket.send(meshData.buffer);
}

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
	// use sketchPage id
	displayList.push(pageIndex);
	//displayList.push(displayListObjectId++); // Unique id for this display object.

	rgba[0] = clamp(rgba[0], 0, 1);
	rgba[1] = clamp(rgba[1], 0, 1);
	rgba[2] = clamp(rgba[2], 0, 1);
	rgba[3] = clamp(rgba[3], 0, 1);

	displayList.push( floor(255*rgba[0]) << 8 | floor(255*rgba[1]) ); // Color: red, green
	displayList.push( floor(255*rgba[2]) << 8 | floor(255*rgba[3]) ); //        blue, alpha

	if (s) {
		// zhenyi for text, actually I think it is in windows coordinate system
		x = ((x / w) * 2) - 1;
		y = (h/w - (y / w * 2));  // x and y should be in [-1,1] range with respect to 
		displayList.push(_convertToFloatByte(x)[0]);
		displayList.push(_convertToFloatByte(x)[1]);
		displayList.push(_convertToFloatByte(y)[0]);
		displayList.push(_convertToFloatByte(y)[1]);

		const OFF_FLOAT = _convertToFloatByte(((window.PUSHED_sketch_zOffset) ? (window.PUSHED_sketch_zOffset) : 0));
		displayList.push(OFF_FLOAT[0]);
		displayList.push(OFF_FLOAT[1]);

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
	for (i = 0 ; i < text.length ; i += 2) {
		let ch0 = text.charCodeAt(i);                            // Two characters per 2-byte word.
		let ch1 = i+1 == text.length ? 0 : text.charCodeAt(i+1); // Pad with 0 if necessary.
		displayList.push(ch0 << 8 | ch1);
	}
}

var _farr = new Float32Array(1);
function  _convertToFloatByte(value) {
	// zhenyi
	//var Buffer = require('buffer/').Buffer;

	//var buf = Buffer.allocUnsafe(4);
	//buf.writeFloatLE(value,0);
	//console.log("value: " + value + " byte array: " + buf);
	//return buf;

	_farr[0] = value;
	const ret = new Uint16Array(_farr.buffer);

	//console.log("fvalue:" + ret);
	return ret;
	//var t = .5 + .5 * value;
	//t = max(0, min(1, t));
	//return floor(0xffff * t);
}

// mode
// sketch id
// submesh idx
// page idx
// mesh type
// transform (x, y, z, rx, ry, rz, sc) for now
// vertex data count
// vertex data
// triangle index data count
// triangle index data

// Meshes ////////////////////////////////////////////////////////////////////////////////////////////////////////////

let hdr_end_idx = 0;

let hdr_end_idx_slices = 0;
function _sendMeshDataHeader(size, mode, type, sketchID, submeshIdx, c) {
	displayListMesh[0] += size;

	const u16s = _convertToFloatByte(time);
	//console.log("HEHE: time\t" + time + "\t" + u16s);
	//console.log("HEHE: type\t" + type);
	displayListMesh[1] = u16s[0];
	displayListMesh[2] = u16s[1];

	// metadata
	displayListMesh.push(mode);
	displayListMesh.push(sketchID);
	displayListMesh.push(submeshIdx);
	displayListMesh.push(pageIndex);
	displayListMesh.push(type);
	displayListMesh.push( floor(255*c[0]) << 8 | floor(255*c[1]) );
	displayListMesh.push( floor(255*c[2]) << 8 | floor(255*c[3]) ); //        blue, alpha
   displayListMesh.push(0);
   hdr_end_idx = displayListMesh.length - 1;
}

// mode, type, sketch id, sub id, page id, type
const HEADER_SIZE_IN_INT16 = 1 + 1 + 1 + 1 + 1;

const TRANSFORM_SIZE_IN_INT16 = (2 + 2 + 2) + (2 + 2 + 2) + 2;

const TRANSFORM_MATRIX_SIZE_IN_INT16 = 2 * 16; // TODO
function _sendTransform(x, y, z, rx, ry, rz, sc, outList = displayListMesh) {
	// transform position
	let u16s = _convertToFloatByte(x);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	u16s = _convertToFloatByte(y);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	u16s = _convertToFloatByte(z);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	// transform rotation
	u16s = _convertToFloatByte(rx);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	u16s = _convertToFloatByte(ry);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	u16s = _convertToFloatByte(rz);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	// transform scale
	u16s = _convertToFloatByte(sc);
	outList.push(u16s[0]);
	outList.push(u16s[1]);
	outList.push(u16s[0]);
	outList.push(u16s[1]);
	outList.push(u16s[0]);
	outList.push(u16s[1]);
}

function _sendTransform3(x, y, z, rx, ry, rz, sx, sy, sz, outList = displayListMesh) {
	// transform position
	let u16s = _convertToFloatByte(x);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	u16s = _convertToFloatByte(y);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	u16s = _convertToFloatByte(z);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	// transform rotation
	u16s = _convertToFloatByte(rx);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	u16s = _convertToFloatByte(ry);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	u16s = _convertToFloatByte(rz);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	// transform scale
	u16s = _convertToFloatByte(sx);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	u16s = _convertToFloatByte(sy);
	outList.push(u16s[0]);
	outList.push(u16s[1]);

	u16s = _convertToFloatByte(sz);
	outList.push(u16s[0]);
	outList.push(u16s[1]);
}

// default identity matrix
const identityMat = [
	1.0, 0.0, 0.0, 0.0,
	0.0, 1.0, 0.0, 0.0,
	0.0, 0.0, 1.0, 0.0,
	0.0, 0.0, 0.0, 1.0
];
// to use in future
function _sendMatrixTransform(matrixToSend = identityMat, outList = displayListMesh) {
	// convert to typed array,
	// get a uint16 view on the data
	const asU16Arr = new Uint16Array(new Float32Array(matrixToSend).buffer);

	for (let i = 0; i < asU16Arr.length; i += 1) {
		outList.push(asU16Arr[i]);
	}
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const MAX_BYTES_BEFORE_SLICE = 30000

function _sendDataInSlices(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sc, transformMatrix, argList) {
   const vertices = argList[0];
   const indices = argList[1];
   const vtxCount = vertices.length;
   const triIdxCount = indices.length;

   let normalCount = 0;
   const normals = argList[2];
   if (normals) {
      normalCount = normals.length;
   }


   let outList = [];

   const header = 'CTmeshSl';
   const headerBuff = new Uint16Array(4);
   for (let i = 0; i < 4 ; i += 1) {
      headerBuff[i] = header.charCodeAt(i<<1) << 8 | header.charCodeAt(i<<1 | 1);
   }

   // Inner Header ===============================
   function addInnerHeader() {
      outList.push(42); // size : unused
      const timeU16s = _convertToFloatByte(time); // time
         outList.push(timeU16s[0]); outList.push(timeU16s[1]);

      outList.push(mode); // mode : send first time (0)
      outList.push(sketchID); // sketchID : the entity id
      submeshIdx = -1;
      outList.push(submeshIdx); // repurposed as user id... here should always be -1
         console.assert(submeshIdx == -1);
      outList.push(pageIndex); // should always be non-negative
         console.assert(pageIndex >= 0);
      outList.push(type); // type : only support polyhedron (6) now
         console.assert(type == 6);
      // colors as 2 u16s
      outList.push( floor(255*c[0]) << 8 | floor(255*c[1]) );
      outList.push( floor(255*c[2]) << 8 | floor(255*c[3]) ); //        blue, alpha
      // unused for splitting, but would be to tell the client how to skip this payload
      outList.push(42);
   }
   addInnerHeader();
   // payload ============================================================================
   if (!z) {
      z = 0.0;
   }
   if (!rz) {
      rz = 0.0;
   }
   _sendTransform(x, y, z, rx, ry, rz, sc, outList);
   _sendMatrixTransform(transformMatrix, outList);


   outList.push(vtxCount);
   let u16s = null;
   for (let v = 0; v < vtxCount; v += 1) {
      u16s = _convertToFloatByte(vertices[v]);
      outList.push(u16s[0]);
      outList.push(u16s[1]);
   }
   outList.push(triIdxCount);
   for (let i = 0; i < triIdxCount; i += 1) {
      outList.push(indices[i]);
   }
   outList.push(normalCount);
   for (let n = 0; n < normalCount; n += 1) {
      u16s = _convertToFloatByte(normals[n]);
      outList.push(u16s[0]);
      outList.push(u16s[1]);
   }
   // ============================================================================


   // for testing
   let sliceSize = outList.length;
   let sliceCount = 1;
   
   let thresh = (MAX_BYTES_BEFORE_SLICE / 2) + 7;
   while (sliceSize >= thresh) {
      sliceSize /= 2;
      sliceCount *= 2;
      thresh += 7;
   }
   sliceSize = Math.ceil(sliceSize);

   outList = new Uint16Array(outList);

   if (pr) {
      console.log(vertices);
      console.log(indices);
      console.log(normals);
      console.assert(normals != null && normals != undefined);

      const see = "mode=" + mode + ", type=" + type + ", sketchID=" + sketchID + ", submeshIdx=" + submeshIdx +
                ", c=" + c + ", x=" + x + ", y=" + y + ", z=" + z + 
                ", rx=" + rx + ", ry=" + ry + ", rz=" + rz + " sc=" + sc;
      console.log(see);     
   }

   function createSlice(slArr, outList, off, slSize, slIdx, slCount) {

      const endExclusive = Math.min(off + slSize, outList.length);

      // slice header ===============================================
      const size16SliceHeader = 4 + 1 + 1 + 1; // label, entityID, sliceCount, sliceIndex, 
      const sl = new Uint16Array(size16SliceHeader + (endExclusive - off));
      sl.set(headerBuff);
      sl[0 + 4] = sketchID;
      sl[1 + 4] = slCount;
      sl[2 + 4] = slIdx;
      // ============================================================
      const cursor = 3 + 4;


      const subarr = outList.subarray(off, endExclusive);
      // add the payload
      sl.set(outList.subarray(off, endExclusive), cursor);

      if (pr) {
         console.log(outList);
         console.log(subarr);
         console.log(sl);
      }

      slArr.push(sl);


      return endExclusive;
   }

   let slices = [];
   let off = 0;

   
   for (let i = 0; i < sliceCount; i += 1) {
      off = createSlice(slices, outList, off, sliceSize, i, sliceCount);
   }

   const sendBegin = getRandomInt(0, sliceCount);
   let sendIdx = sendBegin;
   do {
      server.socket.send(slices[sendIdx].buffer);
      sendIdx = (sendIdx + 1) % slices.length;
   } while (sendIdx != sendBegin);
   // for (let i = 0; i < slices.length; i += 1) {
   //    server.socket.send(slices[i].buffer);
   // }
}


function _sendPolyhedronData(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sc, transformMatrix, argList) {
	const vertices = argList[0];
	const indices = argList[1];
	const vtxCount = vertices.length;
	const triIdxCount = indices.length;

	let normalCount = 0;
	const normals = argList[2];
	if (normals) {
		normalCount = normals.length;
	}

   const bytesMainPayload = (vtxCount + triIdxCount + normalCount) * 4;
   if ((displayListMesh.length * 2) + bytesMainPayload >= MAX_BYTES_BEFORE_SLICE) {
      _sendDataInSlices(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sc, transformMatrix, argList);
      return true;
   }

   // if over the limit, divide the data, send to different displayListMesh since the 
   // check for duplicates is different: [timestamp, sliceCount, sliceIdx | payload ...]

	// count means #number ofuint16s, so a float gets a count of 2
	const size = HEADER_SIZE_IN_INT16 + TRANSFORM_SIZE_IN_INT16 + 1 + (vtxCount * 2) + 1 + (triIdxCount) + 1 + (normalCount * 2);
	_sendMeshDataHeader(size, mode, type, sketchID, submeshIdx, c);


	if (!z) {
		z = 0.0;
	}
	if (!rz) {
		rz = 0.0;
	}

	_sendTransform(x, y, z, rx, ry, rz, sc);
	_sendMatrixTransform(transformMatrix);

	let u16s = null;



   // 

	displayListMesh.push(vtxCount);
	for (let v = 0; v < vtxCount; v += 1) {
		u16s = _convertToFloatByte(vertices[v]);
		displayListMesh.push(u16s[0]);
		displayListMesh.push(u16s[1]);
	}

	displayListMesh.push(triIdxCount);
	for (let i = 0; i < triIdxCount; i += 1) {
		displayListMesh.push(indices[i]);
	}

	displayListMesh.push(normalCount);
	for (let n = 0; n < normalCount; n += 1) {
		u16s = _convertToFloatByte(normals[n]);
		displayListMesh.push(u16s[0]);
		displayListMesh.push(u16s[1]);
	}
}

/*    function _sendCubeData(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sc, transformMatrix) {
// count means #number ofuint16s, so a float gets a count of 2
const size = HEADER_SIZE_IN_INT16 + TRANSFORM_SIZE_IN_INT16;
_sendMeshDataHeader(size, mode, type, sketchID, submeshIdx, c);


if (!z) {
z = 0.0;
}
if (!rz) {
rz = 0.0;
}

_sendTransform(x, y, z, rx, ry, rz, sc);
_sendMatrixTransform(transformMatrix);
} */

function _sendCubeData(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sx, sy, sz, transformMatrix) {
// count means #number ofuint16s, so a float gets a count of 2
	const size = HEADER_SIZE_IN_INT16 + TRANSFORM_SIZE_IN_INT16;
	_sendMeshDataHeader(size, mode, type, sketchID, submeshIdx, c);

	if (!z) {
		z = 0.0;
	}
	if (!rz) {
		rz = 0.0;
	}

	_sendTransform3(x, y, z, rx, ry, rz, sx, sy, sz);
	_sendMatrixTransform(transformMatrix);
}

function _sendSquareData(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sc, transformMatrix) {
	// count means #number ofuint16s, so a float gets a count of 2
	const size = HEADER_SIZE_IN_INT16 + TRANSFORM_SIZE_IN_INT16;
	_sendMeshDataHeader(size, mode, type, sketchID, submeshIdx, c);

	if (!z) {
		z = 0.0;
	}
	if (!rz) {
		rz = 0.0;
	}

	_sendTransform(x, y, z, rx, ry, rz, sc);
	_sendMatrixTransform(transformMatrix);
}

function _sendSphereData(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sc, transformMatrix, argList) {
	// argList will have to contain extra parameters that the sphere supports.
	// Gabriel implemented an "amount of the sphere to cut-off" - TODO (get that info)
	// count means #number ofuint16s, so a float gets a count of 2
	const size = HEADER_SIZE_IN_INT16 + TRANSFORM_SIZE_IN_INT16 + 2;
	_sendMeshDataHeader(size, mode, type, sketchID, submeshIdx, c);

	if (!z) {
		z = 0.0;
	}
	if (!rz) {
		rz = 0.0;
	}

	_sendTransform(x, y, z, rx, ry, rz, sc);
	_sendMatrixTransform(transformMatrix);

	// send amount to cut-off
	const amountToCutOff = argList[0] || 1.0;
	const u16s = _convertToFloatByte(amountToCutOff);
	displayListMesh.push(u16s[0]);
	displayListMesh.push(u16s[1]);
}

function _sendTorusData(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sc, transformMatrix, argList) {
	// count means #number ofuint16s, so a float gets a count of 2
	const size = HEADER_SIZE_IN_INT16 + TRANSFORM_SIZE_IN_INT16 + 2;
	_sendMeshDataHeader(size, mode, type, sketchID, submeshIdx, c);

	if (!z) {
		z = 0.0;
	}
	if (!rz) {
		rz = 0.0;
	}

	_sendTransform(x, y, z, rx, ry, rz, sc);
	_sendMatrixTransform(transformMatrix);

	// send radius
	const radius = argList[0] || 0.3;
	const u16s = _convertToFloatByte(radius);
	displayListMesh.push(u16s[0]);
	displayListMesh.push(u16s[1]);
}

function _sendOpenCylinderData(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sc, transformMatrix, argList) {
	// count means #number ofuint16s, so a float gets a count of 2
	const size = HEADER_SIZE_IN_INT16 + TRANSFORM_SIZE_IN_INT16 + 1;
	_sendMeshDataHeader(size, mode, type, sketchID, submeshIdx, c);

	if (!z) {
		z = 0.0;
	}
	if (!rz) {
		rz = 0.0;
	}

	_sendTransform(x, y, z, rx, ry, rz, sc);
	_sendMatrixTransform(transformMatrix);

	// send number of segments
	const numSegments = argList[0] || 10;
	displayListMesh.push(numSegments);
}

function _sendDiskData(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sc, transformMatrix, argList) {
	// count means #number ofuint16s, so a float gets a count of 2
	const size = HEADER_SIZE_IN_INT16 + TRANSFORM_SIZE_IN_INT16 + 1;
	_sendMeshDataHeader(size, mode, type, sketchID, submeshIdx, c);

	if (!z) {
		z = 0.0;
	}
	if (!rz) {
		rz = 0.0;
	}

	_sendTransform(x, y, z, rx, ry, rz, sc);
	_sendMatrixTransform(transformMatrix);

	// send number of segments
	const numSegments = argList[0] || 10;
	displayListMesh.push(numSegments);
}

const shapeTypeToNum = {
	"Cube" : 0,
	"Cylinder" : 1,
	"Disk" : 2,
	"Extruded" : 3,
	"OpenCylinder" : 4,
	"Parametric" : 5,
	"Polyhedron" : 6,
	"Revolved" : 7,
	"Sphere" : 8,
	"Square" : 9,
	"Torus" : 10,
	"Cone" : 11,
	"OpenCone" : 12
};

const UNIMPLEMENTED_FUNCTION = function(mode, type, sketchID, submeshIdx, c) { 
	//console.log("not implemented yet");
	_sendMeshDataHeader(HEADER_SIZE_IN_INT16 + 1 /* 1 for two null bytes */, mode, type, sketchID, submeshIdx, c);
};

const shapeTypeToFunction = {
	"Cube" : _sendCubeData,
	"Cylinder" : UNIMPLEMENTED_FUNCTION, // (KTR) I ignore the cylinder since it's just 2 disks + 1 open cylinder
	"Disk" : _sendDiskData,
	"Extruded" : UNIMPLEMENTED_FUNCTION, // uses custom functions
	"OpenCylinder" : _sendOpenCylinderData,
	"Parametric" : UNIMPLEMENTED_FUNCTION, // uses custom functions
	"Polyhedron" : _sendPolyhedronData,
	"Revolved" : UNIMPLEMENTED_FUNCTION, // uses custom functions
	"Sphere" : _sendSphereData,
	"Square" : _sendSquareData,
	"Torus" : _sendTorusData,
	"Cone" : UNIMPLEMENTED_FUNCTION,
	"OpenCone" : UNIMPLEMENTED_FUNCTION
};


function _sendMeshData(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sx, sy, sz, transformMatrix, argList) {
	//console.log("HEHE: + func _sendMeshData type\t" + type);
	const fn = shapeTypeToFunction[type];
	if (fn) {
		if (!fn(mode, shapeTypeToNum[type], sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sx, sy, sz, transformMatrix, argList)) {
		   displayListMesh[hdr_end_idx] = displayListMesh.length - hdr_end_idx - 1;
      }
    }
	else {
		console.log("unsupported shape");
	} 
}

function _updateMeshData(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sx, sy, sz, transformMatrix, argList) {
   if (type == "Cube") {
      _sendMeshDataHeader(0, mode, type, sketchID, submeshIdx, c);

      _sendTransform3(x, y, z, rx, ry, rz, sx, sy, sz);
      _sendMatrixTransform(transformMatrix);
   }
   else if (shapeTypeToFunction[type]) {
      _sendMeshDataHeader(0, mode, type, sketchID, submeshIdx, c);

      _sendTransform(x, y, z, rx, ry, rz, sx);
      _sendMatrixTransform(transformMatrix);
   }
   else {
      console.log("unsupported shape"); 
   }
}

function _drawMeshChild(child){
	const S = sk();
	if (S) {
		//console.log(time, child._globalMatrix[12], child._globalMatrix[13], child._globalMatrix[14], child._globalMatrix[15]);
		let Q = [child];
		while (Q.length != 0) {
			let c = Q.shift();
			if(c.typeName){
				enqueueSendMeshData(c.typeName, c, S);

				if (c._children) {
					const children = c._children;
					for (let i = 0; i < children.length; i += 1) {
						Q.unshift(children[i]);
					}
				}
			}			
		}
	}
}

var matTranslationBuff   = [0, 0, 0];
var matRotationBuff      = [0, 0, 0];
var matScaleBuff         = [0, 0, 0];
function getTranslation(matrix) {
   matTranslationBuff[0] = matrix[12];
   matTranslationBuff[1] = matrix[13];
   matTranslationBuff[2] = matrix[14];

   return matTranslationBuff;
}

function getRotation(matrix) {
   //matRotationBuff[0] = matrix[0];
   //matRotationBuff[1] = matrix[5];
   //matRotationBuff[2] = matrix[10];
   return matRotationBuff;
}

function getScale(matrix) {
   matScaleBuff[0] = matrix[0];
   matScaleBuff[1] = matrix[5];
   matScaleBuff[2] = matrix[10];
   
   return matScaleBuff;
}