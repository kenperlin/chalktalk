"use strict";

// USER FUNCTIONS
var meshDataSendCallbackQueue = [];
function enqueueSendMeshData(type, child, sketch) {
   if (!child._shape) {
      return;
   }

   const a = child._shape.argA;
   const b = child._shape.argB;
   const c = child._shape.argC;
   const d = child._shape.argD;

   meshDataSendCallbackQueue.push(function() {
	   // todo call parent's drawMatrix for now
	   var matResult;
	  /* if(child._parent && child._parent._draw_matrix){
		  var parentMatrix = CT.matrixMultiply(pixelSpaceTo3DSpaceMatrix(), child._parent._draw_matrix);
		  console.log("child._globalMatrix:", child._globalMatrix);
		matResult = CT.matrixMultiply(parentMatrix, CT.matrixMultiply(child._globalMatrix, child._matrix));//CT.matrixMultiply(pixelSpaceTo3DSpaceMatrix(), matrix);
		//matResult = child._globalMatrix;
	  }else{
		matResult = CT.matrixMultiply(child._globalMatrix, child._matrix);
	  } */
	   matResult = child._globalMatrix;
		//matResult = CT.matrixMultiply(child._globalMatrix, child._matrix);
      const trans = getTranslation(matResult);
      const rot   = getRotation(matResult);
      const scale = sketch.scale() * sketch.xyzS() / 7;
      //getScale(matResult);

      //console.log(trans, scale);
      if (isNaN(trans[0])) {
         return;
      }

      // temp
      // rot[0] = sketch.rX;
      // rot[1] = sketch.rY;
      // rot[2] = 0;

      const rx = sketch.rX; 
      const ry = sketch.rY;
      const yy = min(1, 4 * ry * ry);

      const rotX = -PI * ry;
      const rotY = PI * rx * (1 - yy);
      const rotZ = -PI * rx *      yy;

      rot[0] = rotX;
      rot[1] = rotY;
      rot[2] = rotZ;

      //const shapeID = child._shape.ID;


   	// sketch.color is a ... string in the format rgb(r,g,b))
   	const index1 = sketch.color.indexOf(',');
   	const index2 = sketch.color.indexOf(',',index1+1);
   	const colorr = parseInt(sketch.color.substring(sketch.color.indexOf('(')+1,index1));
   	const colorg = parseInt(sketch.color.substring(index1+1,index2));
   	const colorb = parseInt(sketch.color.substring(index2+1,sketch.color.indexOf(')')));
   	const color = [colorr/255, colorg/255, colorb/255, 1];

   	if (!sketch._scaleX) {
         _sendMeshData(
            0, type, sketch.id, -1, 
   		   color,
   		   trans[0], trans[1], sketch.zOffset(),
            rot[0], rot[1], rot[2], scale,
            matResult, /* the story doesn't end here--the global matrix doesn't seem to cover sub-meshes */
            [a, b, c, d]
         );
   	} 
      else {
   	   _sendMeshData(
            0, type, sketch.id, -1, 
   		   color,
   		   trans[0], trans[1], sketch.zOffset(),
            rot[0], rot[1], rot[2], scale * sketch._scaleX, scale * sketch._scaleY, scale,
            matResult, /* the story doesn't end here--the global matrix doesn't seem to cover sub-meshes */
            [a, b, c, d]
         );
   	}
   });
}
