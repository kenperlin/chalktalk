   "use strict";

   let glyphChartDrawDisabled = true;

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


   function _sendMeshDataHeader(size, mode, type, sketchID, submeshIdx, c) {
      displayListMesh[0] += size;

      const u16s = _convertToFloatByte(time);
	  console.log("HEHE: time\t" + time + "\t" + u16s);
	  console.log("HEHE: type\t" + type);
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
   }

   // mode, type, sketch id, sub id, page id, type
   const HEADER_SIZE_IN_INT16 = 1 + 1 + 1 + 1 + 1;

   const TRANSFORM_SIZE_IN_INT16 = (2 + 2 + 2) + (2 + 2 + 2) + 2;

   const TRANSFORM_MATRIX_SIZE_IN_INT16 = 2 * 16; // TODO
   function _sendTransform(x, y, z, rx, ry, rz, sc) {
      // transform position
      let u16s = _convertToFloatByte(x);
      displayListMesh.push(u16s[0]);
      displayListMesh.push(u16s[1]);

      u16s = _convertToFloatByte(y);
      displayListMesh.push(u16s[0]);
      displayListMesh.push(u16s[1]);

      u16s = _convertToFloatByte(z);
      displayListMesh.push(u16s[0]);
      displayListMesh.push(u16s[1]);

      // transform rotation
      u16s = _convertToFloatByte(rx);
      displayListMesh.push(u16s[0]);
      displayListMesh.push(u16s[1]);

      u16s = _convertToFloatByte(ry);
      displayListMesh.push(u16s[0]);
      displayListMesh.push(u16s[1]);

      u16s = _convertToFloatByte(rz);
      displayListMesh.push(u16s[0]);
      displayListMesh.push(u16s[1]);

      // transform scale
      u16s = _convertToFloatByte(sc);
      displayListMesh.push(u16s[0]);
      displayListMesh.push(u16s[1]);
   }

   // default identity matrix
   const identityMat = [
       1.0, 0.0, 0.0, 0.0,
       0.0, 1.0, 0.0, 0.0,
       0.0, 0.0, 1.0, 0.0,
       0.0, 0.0, 0.0, 1.0
   ];
   // to use in future
   function _sendMatrixTransform(matrixToSend = identityMat) {
      // convert to typed array,
      // get a uint16 view on the data
      const asU16Arr = new Uint16Array(
         new Float32Array(
            matrixToSend
         ).buffer
      )

      for (let i = 0; i < asU16Arr.length; i += 1) {
         displayListMesh.push(asU16Arr[i]);
      }
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

   function _sendCubeData(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sc, transformMatrix) {
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
      "Torus" : 10
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
      "Torus" : _sendTorusData
   };


   // KTR use this .. TODO send transform matrix instead of individual components
   function _sendMeshData(mode, type, sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sc, transformMatrix, argList) {
		//console.log("HEHE: + func _sendMeshData type\t" + type);
      const fn = shapeTypeToFunction[type];
      if (fn) {

         fn(mode, shapeTypeToNum[type], sketchID, submeshIdx, c, x, y, z, rx, ry, rz, sc, transformMatrix, argList);
      }
      else {
         console.log("unsupported shape");
      } 
   }
